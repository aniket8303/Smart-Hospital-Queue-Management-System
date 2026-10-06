package com.mediqueue.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "queue_tokens", indexes = {
    @Index(name = "idx_queue_day_status", columnList = "queueDay, status"),
    @Index(name = "idx_token_number", columnList = "tokenNumber")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QueueToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String tokenNumber; // e.g., "A-042", "C-002"

    @Column(nullable = false)
    private Long patientId;

    @Column(nullable = false)
    private String patientName;

    private Integer patientAge;

    private String patientGender;

    private String patientPhone;

    @Column(nullable = false)
    private Long doctorId;

    private String doctorName;

    @Column(nullable = false)
    private Long departmentId;

    private String departmentName;

    private String roomNumber;

    @Column(nullable = false)
    private LocalDate queueDay; // e.g., 2026-10-06 (Daily Queue isolation)

    @Column(nullable = false)
    private Integer position;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    private QueueStatus status; // WAITING, NEXT, IN_CONSULTATION, COMPLETED, SKIPPED, CANCELLED

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private Priority priority; // NORMAL, HIGH, URGENT

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TokenSource source; // RECEPTION, MOBILE, KIOSK

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TokenType tokenType; // PHYSICAL, DIGITAL

    private Integer estimatedWaitMinutes;

    private Double consultationFee;

    private String transactionId;

    private String paymentMethod;

    private String paymentStatus;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime calledAt;

    private LocalDateTime completedAt;

    public enum QueueStatus {
        WAITING,
        NEXT,
        IN_CONSULTATION,
        COMPLETED,
        SKIPPED,
        CANCELLED
    }

    public enum Priority {
        NORMAL,
        HIGH,
        URGENT
    }

    public enum TokenSource {
        RECEPTION,
        MOBILE,
        KIOSK
    }

    public enum TokenType {
        PHYSICAL,
        DIGITAL
    }
}
