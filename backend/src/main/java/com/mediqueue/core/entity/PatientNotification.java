package com.mediqueue.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_notifications", indexes = {
    @Index(name = "idx_notif_patient", columnList = "patientId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long patientId;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(nullable = false, length = 30)
    private String type; // INFO, SUCCESS, WARNING, URGENT

    private String tokenNumber;

    @Column(nullable = false)
    private Boolean isRead;

    private String smsRecipient;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
