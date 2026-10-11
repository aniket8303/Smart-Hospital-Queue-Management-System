package com.mediqueue.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification_outbox", indexes = {
    @Index(name = "idx_status_scheduled", columnList = "status, scheduledAt"),
    @Index(name = "idx_token_notifs", columnList = "tokenNumber")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationOutbox {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String tokenNumber;

    @Column(nullable = false)
    private Long patientId;

    @Column(nullable = false, length = 20)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Channel channel = Channel.SMS;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 35)
    private AlertType alertType;

    @Column(nullable = false, length = 500)
    private String messageBody;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private DeliveryStatus status = DeliveryStatus.PENDING;

    @Builder.Default
    private int retryCount = 0;

    @Column(length = 30)
    @Builder.Default
    private String provider = "FAST2SMS"; // FAST2SMS, TWILIO, MOCK_SMS

    @Column(length = 100)
    private String providerMessageId;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    private LocalDateTime sentAt;

    @Column(length = 500)
    private String failureReason;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public enum Channel {
        SMS,
        IN_APP,
        PUSH
    }

    public enum AlertType {
        REGISTRATION_CONFIRMED,
        TURN_15MIN,
        TURN_5MIN,
        NEXT_IN_LINE,
        TOKEN_CALLED,
        DELAY_ADVISORY,
        CANCELLED
    }

    public enum DeliveryStatus {
        PENDING,
        SENT,
        DELIVERED,
        FAILED
    }
}
