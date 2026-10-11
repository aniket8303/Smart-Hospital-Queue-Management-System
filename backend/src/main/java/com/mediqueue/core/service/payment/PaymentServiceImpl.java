package com.mediqueue.core.service.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mediqueue.core.entity.AuditEvent;
import com.mediqueue.core.entity.Doctor;
import com.mediqueue.core.entity.PaymentOrder;
import com.mediqueue.core.entity.PaymentRecord;
import com.mediqueue.core.entity.PaymentTransaction;
import com.mediqueue.core.entity.QueueToken;
import com.mediqueue.core.repository.AuditEventRepository;
import com.mediqueue.core.repository.DoctorRepository;
import com.mediqueue.core.repository.PaymentOrderRepository;
import com.mediqueue.core.repository.PaymentRecordRepository;
import com.mediqueue.core.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentOrderRepository orderRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final DoctorRepository doctorRepository;
    private final AuditEventRepository auditEventRepository;
    private final PaymentGateway paymentGateway;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public PaymentOrder createOrder(Long patientId, String patientName, Long departmentId, Long doctorId,
                                    QueueToken.TokenSource source, String paymentMethod, String idempotencyKey) {
        // 1. Check idempotency: if order already exists with idempotencyKey, return existing order
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            Optional<PaymentOrder> existing = orderRepository.findByIdempotencyKey(idempotencyKey);
            if (existing.isPresent()) {
                log.info("Idempotent order replay: returning existing order {}", existing.get().getOrderId());
                return existing.get();
            }
        }

        // 2. Authoritative server-side fee calculation
        Double amount = 300.0;
        if (doctorId != null) {
            Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
            if (doctorOpt.isPresent() && doctorOpt.get().getConsultationFee() != null) {
                amount = doctorOpt.get().getConsultationFee();
            }
        }

        // 3. Generate unique order reference
        String internalOrderId = "ord_mq_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 6);

        // 4. Create gateway order
        Map<String, Object> gatewayOrder = paymentGateway.createOrder(amount, "INR", internalOrderId);
        String providerOrderId = (String) gatewayOrder.get("providerOrderId");

        PaymentOrder order = PaymentOrder.builder()
                .orderId(internalOrderId)
                .patientId(patientId != null ? patientId : 1L)
                .patientName(patientName != null && !patientName.isBlank() ? patientName : "Patient")
                .amount(amount)
                .currency("INR")
                .status(PaymentOrder.OrderStatus.CREATED)
                .departmentId(departmentId)
                .doctorId(doctorId)
                .source(source != null ? source : QueueToken.TokenSource.MOBILE)
                .paymentMethod(paymentMethod != null ? paymentMethod : "UPI")
                .provider(paymentGateway.getProviderName())
                .providerOrderId(providerOrderId)
                .idempotencyKey(idempotencyKey)
                .createdAt(LocalDateTime.now())
                .build();

        PaymentOrder saved = orderRepository.save(order);

        auditEventRepository.save(AuditEvent.builder()
                .eventType("PAYMENT_ORDER_CREATED")
                .actorRole("PATIENT")
                .patientId(patientId)
                .details(String.format("Payment order %s created for ₹%.2f via %s", internalOrderId, amount, paymentMethod))
                .timestamp(LocalDateTime.now())
                .build());

        return saved;
    }

    @Override
    @Transactional
    public PaymentTransaction verifyAndConfirmPayment(String orderId, String paymentId, String signature) {
        PaymentOrder order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Payment order not found: " + orderId));

        // If already paid, return existing success transaction (Idempotency)
        if (order.getStatus() == PaymentOrder.OrderStatus.PAID) {
            log.info("Order {} already verified as PAID. Returning existing transaction.", orderId);
            return transactionRepository.findByOrderIdOrderByCreatedAtDesc(orderId).stream().findFirst()
                    .orElseGet(() -> recordTransaction(order, paymentId, true));
        }

        // Cryptographic verification
        boolean isValid = paymentGateway.verifyPaymentSignature(order.getProviderOrderId(), paymentId, signature);
        if (!isValid) {
            log.warn("Security Alert: Invalid payment signature detected for order: {}", orderId);
            auditEventRepository.save(AuditEvent.builder()
                    .eventType("PAYMENT_SIGNATURE_TAMPERED")
                    .actorRole("SYSTEM")
                    .patientId(order.getPatientId())
                    .details("Signature mismatch for order " + orderId + ", paymentId " + paymentId)
                    .timestamp(LocalDateTime.now())
                    .build());
            throw new IllegalArgumentException("Invalid payment signature. Verification failed.");
        }

        // Update Order to PAID
        order.setStatus(PaymentOrder.OrderStatus.PAID);
        order.setProviderPaymentId(paymentId);
        order.setProviderSignature(signature);
        order.setPaidAt(LocalDateTime.now());
        orderRepository.save(order);

        // Record verified transaction
        PaymentTransaction txn = recordTransaction(order, paymentId, true);

        // Record patient financial history record
        paymentRecordRepository.save(PaymentRecord.builder()
                .patientId(order.getPatientId())
                .patientName(order.getPatientName())
                .departmentName("OPD Consultation")
                .doctorName("Consulting Physician")
                .amount(order.getAmount())
                .paymentMethod(order.getPaymentMethod())
                .transactionId(paymentId)
                .status("COMPLETED")
                .isDemo(false)
                .receiptUrl("/api/patient/payments/receipt/" + paymentId)
                .paidAt(LocalDateTime.now())
                .build());

        auditEventRepository.save(AuditEvent.builder()
                .eventType("PAYMENT_VERIFIED_SUCCESS")
                .actorRole("SYSTEM")
                .patientId(order.getPatientId())
                .details(String.format("Order %s verified successfully. Amount: ₹%.2f, Txn: %s", orderId, order.getAmount(), paymentId))
                .timestamp(LocalDateTime.now())
                .build());

        return txn;
    }

    @Override
    @Transactional
    public PaymentTransaction processWebhook(String rawPayload, String signature) {
        boolean isSigValid = paymentGateway.verifyWebhookSignature(rawPayload, signature);
        if (!isSigValid) {
            log.warn("Invalid webhook signature received.");
            throw new IllegalArgumentException("Invalid webhook signature.");
        }

        try {
            JsonNode root = objectMapper.readTree(rawPayload);
            String event = root.path("event").asText("");
            String providerOrderId = root.path("payload").path("payment").path("entity").path("order_id").asText();
            String paymentId = root.path("payload").path("payment").path("entity").path("id").asText();
            double amountInPaise = root.path("payload").path("payment").path("entity").path("amount").asDouble(0);

            if (providerOrderId.isBlank()) {
                providerOrderId = root.path("orderId").asText();
            }
            if (paymentId.isBlank()) {
                paymentId = root.path("paymentId").asText("wh_txn_" + System.currentTimeMillis());
            }

            Optional<PaymentOrder> orderOpt = orderRepository.findByProviderOrderId(providerOrderId);
            if (orderOpt.isEmpty()) {
                orderOpt = orderRepository.findByOrderId(providerOrderId);
            }

            if (orderOpt.isEmpty()) {
                log.warn("Webhook references unknown order: {}", providerOrderId);
                return null;
            }

            PaymentOrder order = orderOpt.get();

            // Duplicate webhook check (Idempotency)
            Optional<PaymentTransaction> existingTxn = transactionRepository.findByTransactionId(paymentId);
            if (existingTxn.isPresent()) {
                log.info("Duplicate webhook event ignored for txn: {}", paymentId);
                return existingTxn.get();
            }

            if ("payment.captured".equals(event) || "SUCCESS".equalsIgnoreCase(root.path("status").asText())) {
                order.setStatus(PaymentOrder.OrderStatus.PAID);
                order.setProviderPaymentId(paymentId);
                order.setPaidAt(LocalDateTime.now());
                orderRepository.save(order);

                PaymentTransaction txn = PaymentTransaction.builder()
                        .orderId(order.getOrderId())
                        .transactionId(paymentId)
                        .amount(order.getAmount())
                        .status("SUCCESS")
                        .signatureVerified(true)
                        .webhookPayload(rawPayload)
                        .createdAt(LocalDateTime.now())
                        .build();

                return transactionRepository.save(txn);
            }

            return null;
        } catch (Exception e) {
            log.error("Error processing payment webhook: {}", e.getMessage(), e);
            throw new RuntimeException("Webhook processing error", e);
        }
    }

    private PaymentTransaction recordTransaction(PaymentOrder order, String paymentId, boolean verified) {
        PaymentTransaction txn = PaymentTransaction.builder()
                .orderId(order.getOrderId())
                .transactionId(paymentId != null ? paymentId : "txn_" + System.currentTimeMillis())
                .amount(order.getAmount())
                .status("SUCCESS")
                .signatureVerified(verified)
                .createdAt(LocalDateTime.now())
                .build();
        return transactionRepository.save(txn);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentOrder getOrder(String orderId) {
        return orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentOrder> getOrdersByPatient(Long patientId) {
        return orderRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    @Override
    public Map<String, Object> getPaymentProviderStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("activeProvider", paymentGateway.getProviderName());
        status.put("currency", "INR");
        status.put("webhookSupported", true);
        status.put("signatureVerification", "HMAC-SHA256 Active");
        status.put("status", "HEALTHY");
        return status;
    }
}
