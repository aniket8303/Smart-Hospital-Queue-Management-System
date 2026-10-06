package com.mediqueue.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "kiosk_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KioskSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String sessionId;

    @Column(nullable = false)
    private String kioskHardwareId; // e.g. "KIOSK-LOBBY-01"

    @Column(nullable = false)
    private Integer step; // 1: Dept, 2: Doc, 3: Patient, 4: Pay, 5: Token

    @Column(nullable = false, length = 10)
    private String language; // "en", "hi", "mr"

    private Long selectedDepartmentId;

    private Long selectedDoctorId;

    private String patientName;

    private Integer patientAge;

    private String patientGender;

    private String patientPhone;

    private Boolean isExistingPatient;

    private Double feeAmount;

    private String paymentMethod; // UPI, CARD, CASH

    private String paymentStatus; // PENDING, SUCCESS, ABANDONED

    private String transactionId;

    private String generatedTokenNumber;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    private LocalDateTime lastInteractionAt;

    private LocalDateTime completedAt;

    private Boolean isAbandoned;
}
