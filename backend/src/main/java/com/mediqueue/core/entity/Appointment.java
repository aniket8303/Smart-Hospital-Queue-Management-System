package com.mediqueue.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_appointments", indexes = {
    @Index(name = "idx_appt_patient", columnList = "patientId"),
    @Index(name = "idx_appt_doctor", columnList = "doctorId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long patientId;

    @Column(nullable = false)
    private String patientName;

    @Column(nullable = false)
    private Long doctorId;

    @Column(nullable = false)
    private String doctorName;

    @Column(nullable = false)
    private Long departmentId;

    @Column(nullable = false)
    private String departmentName;

    private String roomNumber;

    @Column(nullable = false)
    private LocalDateTime scheduledTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AppointmentStatus status; // CONFIRMED, COMPLETED, CANCELLED, RESCHEDULED

    private String reason;

    private String tokenNumber; // attached token if patient checked in

    private LocalDateTime createdAt;

    public enum AppointmentStatus {
        CONFIRMED,
        COMPLETED,
        CANCELLED,
        RESCHEDULED
    }
}
