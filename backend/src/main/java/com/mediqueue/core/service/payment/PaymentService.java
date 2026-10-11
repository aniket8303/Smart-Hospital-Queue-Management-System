package com.mediqueue.core.service.payment;

import com.mediqueue.core.entity.PaymentOrder;
import com.mediqueue.core.entity.PaymentTransaction;
import com.mediqueue.core.entity.QueueToken;

import java.util.List;
import java.util.Map;

public interface PaymentService {
    PaymentOrder createOrder(Long patientId, String patientName, Long departmentId, Long doctorId,
                             QueueToken.TokenSource source, String paymentMethod, String idempotencyKey);

    PaymentTransaction verifyAndConfirmPayment(String orderId, String paymentId, String signature);

    PaymentTransaction processWebhook(String rawPayload, String signature);

    PaymentOrder getOrder(String orderId);

    List<PaymentOrder> getOrdersByPatient(Long patientId);

    Map<String, Object> getPaymentProviderStatus();
}
