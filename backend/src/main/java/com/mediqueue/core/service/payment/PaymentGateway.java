package com.mediqueue.core.service.payment;

import java.util.Map;

public interface PaymentGateway {
    String getProviderName();
    Map<String, Object> createOrder(Double amount, String currency, String receiptOrderRef);
    boolean verifyPaymentSignature(String orderId, String paymentId, String signature);
    boolean verifyWebhookSignature(String rawPayload, String signature);
}
