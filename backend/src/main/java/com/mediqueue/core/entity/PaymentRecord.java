package com.mediqueue.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_payments", indexes = {
    @Index(name = "idx_payment_patient", columnList = "patientId"),
    @Index(name = "idx_payment_txn", columnList = "transactionId", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String transactionId; // e.g. "MQ-2026-8303"

    @Column(nullable = false)
    private Long patientId;

    @Column(nullable = false)
    private String patientName;

    private String tokenNumber; // attached token e.g. "GM-042"

    private Long doctorId;

    private String doctorName;

    private Long departmentId;

    private String departmentName;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false, length = 20)
    private String paymentMethod; // UPI, CARD, CASH

    @Column(nullable = false, length = 20)
    private String status; // SUCCESS, PENDING, FAILED

    @Column(nullable = false)
    private Boolean isDemo; // True for simulated MVP payments

    private String receiptUrl;

    @Column(nullable = false)
    private LocalDateTime paidAt;
}
