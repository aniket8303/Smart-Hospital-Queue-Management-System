package com.mediqueue.core.service.payment;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

@Component("razorpayGateway")
@Slf4j
public class RazorpayPaymentGateway implements PaymentGateway {

    @Value("${mediqueue.payment.razorpay.key-id:rzp_test_mediqueue_diksha}")
    private String keyId;

    @Value("${mediqueue.payment.razorpay.key-secret:rzp_sec_mediqueue_secret_2026}")
    private String keySecret;

    @Value("${mediqueue.payment.razorpay.webhook-secret:rzp_wh_secret_2026}")
    private String webhookSecret;

    @Override
    public String getProviderName() {
        return "RAZORPAY";
    }

    @Override
    public Map<String, Object> createOrder(Double amount, String currency, String receiptOrderRef) {
        long amountInPaise = Math.round(amount * 100);
        String generatedProviderOrderId = "order_rzp_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);

        Map<String, Object> orderDetails = new HashMap<>();
        orderDetails.put("providerOrderId", generatedProviderOrderId);
        orderDetails.put("keyId", keyId);
        orderDetails.put("amount", amountInPaise);
        orderDetails.put("currency", currency != null ? currency : "INR");
        orderDetails.put("receipt", receiptOrderRef);
        orderDetails.put("status", "created");
        orderDetails.put("provider", "RAZORPAY");

        log.info("Created Razorpay payment order {} for receipt {} (₹{})", 
                generatedProviderOrderId, receiptOrderRef, amount);
        return orderDetails;
    }

    @Override
    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        if (orderId == null || paymentId == null || signature == null) {
            return false;
        }
        try {
            String payload = orderId + "|" + paymentId;
            String expectedSignature = calculateHmacSha256(payload, keySecret);
            return MessageDigest.isEqual(
                    expectedSignature.getBytes(StandardCharsets.UTF_8),
                    signature.trim().getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            log.error("Failed to verify Razorpay payment signature: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public boolean verifyWebhookSignature(String rawPayload, String signature) {
        if (rawPayload == null || signature == null) {
            return false;
        }
        try {
            String expectedSignature = calculateHmacSha256(rawPayload, webhookSecret);
            return MessageDigest.isEqual(
                    expectedSignature.getBytes(StandardCharsets.UTF_8),
                    signature.trim().getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            log.error("Failed to verify Razorpay webhook signature: {}", e.getMessage());
            return false;
        }
    }

    public static String calculateHmacSha256(String data, String key) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hash);
    }
}
