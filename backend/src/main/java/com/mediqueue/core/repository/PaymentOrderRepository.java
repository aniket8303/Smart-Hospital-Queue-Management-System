package com.mediqueue.core.repository;

import com.mediqueue.core.entity.PaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {
    Optional<PaymentOrder> findByOrderId(String orderId);
    Optional<PaymentOrder> findByProviderOrderId(String providerOrderId);
    Optional<PaymentOrder> findByIdempotencyKey(String idempotencyKey);
    List<PaymentOrder> findByPatientIdOrderByCreatedAtDesc(Long patientId);
}
