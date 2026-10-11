package com.mediqueue.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_orders", indexes = {
    @Index(name = "idx_order_id", columnList = "orderId", unique = true),
    @Index(name = "idx_patient_orders", columnList = "patientId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String orderId; // e.g. order_mq_1728641234_abc

    @Column(nullable = false)
    private Long patientId;

    @Column(nullable = false)
    private String patientName;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OrderStatus status = OrderStatus.CREATED;

    private Long departmentId;

    private Long doctorId;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private QueueToken.TokenSource source; // RECEPTION, MOBILE, KIOSK

    private String paymentMethod; // UPI, CARD, NETBANKING, CASH

    @Column(length = 30)
    @Builder.Default
    private String provider = "RAZORPAY"; // RAZORPAY, CASHFREE, MOCK_GATEWAY

    private String providerOrderId;

    private String providerPaymentId;

    private String providerSignature;

    @Column(length = 100)
    private String idempotencyKey;

    @Column(length = 30)
    private String issuedTokenNumber;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime paidAt;

    public enum OrderStatus {
        CREATED,
        PAID,
        FAILED,
        EXPIRED,
        REFUNDED
    }
}
