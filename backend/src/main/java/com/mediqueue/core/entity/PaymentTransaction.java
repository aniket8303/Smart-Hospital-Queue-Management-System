package com.mediqueue.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions", indexes = {
    @Index(name = "idx_txn_id", columnList = "transactionId", unique = true),
    @Index(name = "idx_order_id_txn", columnList = "orderId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String orderId;

    @Column(nullable = false, unique = true, length = 64)
    private String transactionId;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false, length = 20)
    private String status; // SUCCESS, FAILED, REFUNDED

    @Column(columnDefinition = "TEXT")
    private String webhookPayload;

    private boolean signatureVerified;

    @Builder.Default
    private boolean isRefunded = false;

    private String refundReason;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
