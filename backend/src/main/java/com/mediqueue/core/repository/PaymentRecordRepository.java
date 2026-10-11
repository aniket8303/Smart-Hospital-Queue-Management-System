package com.mediqueue.core.repository;

import com.mediqueue.core.entity.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Long> {
    List<PaymentRecord> findByPatientIdOrderByPaidAtDesc(Long patientId);
    Optional<PaymentRecord> findByTransactionId(String transactionId);
}
