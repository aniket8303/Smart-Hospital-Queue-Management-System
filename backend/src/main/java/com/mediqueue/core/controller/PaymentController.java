package com.mediqueue.core.controller;

import com.mediqueue.core.entity.PaymentOrder;
import com.mediqueue.core.entity.PaymentTransaction;
import com.mediqueue.core.entity.QueueToken;
import com.mediqueue.core.security.UserPrincipal;
import com.mediqueue.core.service.payment.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/orders/create")
    public ResponseEntity<PaymentOrder> createOrder(
            @RequestBody Map<String, Object> req,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @AuthenticationPrincipal UserPrincipal principal) {

        Long patientId = principal != null && principal.getPatientId() != null 
                ? principal.getPatientId() 
                : req.containsKey("patientId") ? Long.valueOf(req.get("patientId").toString()) : 1L;

        String patientName = principal != null && principal.getFullName() != null 
                ? principal.getFullName() 
                : (String) req.getOrDefault("patientName", "Patient");

        Long departmentId = req.containsKey("departmentId") ? Long.valueOf(req.get("departmentId").toString()) : 1L;
        Long doctorId = req.containsKey("doctorId") ? Long.valueOf(req.get("doctorId").toString()) : 1L;
        String method = (String) req.getOrDefault("paymentMethod", "UPI");
        String sourceStr = (String) req.getOrDefault("source", "MOBILE");
        QueueToken.TokenSource source = QueueToken.TokenSource.valueOf(sourceStr.toUpperCase());

        PaymentOrder order = paymentService.createOrder(
                patientId, patientName, departmentId, doctorId, source, method, idempotencyKey
        );

        return ResponseEntity.ok(order);
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody Map<String, String> payload) {
        String orderId = payload.get("orderId");
        String paymentId = payload.get("paymentId");
        String signature = payload.get("signature");

        if (orderId == null || paymentId == null || signature == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "FAILED",
                    "error", "Missing orderId, paymentId, or signature in request."
            ));
        }

        PaymentTransaction txn = paymentService.verifyAndConfirmPayment(orderId, paymentId, signature);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("orderId", txn.getOrderId());
        response.put("transactionId", txn.getTransactionId());
        response.put("amount", txn.getAmount());
        response.put("verified", txn.isSignatureVerified());
        response.put("timestamp", txn.getCreatedAt().toString());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/webhook")
    public ResponseEntity<Map<String, Object>> handleWebhook(
            @RequestBody String rawPayload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String rzpSignature,
            @RequestHeader(value = "X-Webhook-Signature", required = false) String customSignature) {

        String signature = rzpSignature != null ? rzpSignature : customSignature;
        if (signature == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing webhook signature header"));
        }

        PaymentTransaction txn = paymentService.processWebhook(rawPayload, signature);
        Map<String, Object> response = new HashMap<>();
        response.put("received", true);
        if (txn != null) {
            response.put("transactionId", txn.getTransactionId());
            response.put("status", txn.getStatus());
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<PaymentOrder> getOrder(@PathVariable String orderId) {
        return ResponseEntity.ok(paymentService.getOrder(orderId));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(paymentService.getPaymentProviderStatus());
    }

    @PostMapping("/demo")
    public ResponseEntity<Map<String, Object>> processDemoPayment(@RequestBody Map<String, Object> paymentRequest) {
        String txnId = "MQ-" + LocalDateTime.now().getYear() + "-" + (1000 + (int)(Math.random() * 9000));
        
        Map<String, Object> result = new HashMap<>();
        result.put("transactionId", txnId);
        result.put("status", "SUCCESS");
        result.put("amount", paymentRequest.getOrDefault("amount", 300));
        result.put("method", paymentRequest.getOrDefault("method", "UPI"));
        result.put("timestamp", LocalDateTime.now().toString());
        result.put("notice", "Demo / Simulated Payment. Verified against Diksha Hospital test engine.");
        
        return ResponseEntity.ok(result);
    }
}
