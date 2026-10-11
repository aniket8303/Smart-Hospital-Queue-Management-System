package com.mediqueue.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients", indexes = {
    @Index(name = "idx_patient_uhid", columnList = "uhid", unique = true),
    @Index(name = "idx_patient_phone", columnList = "phone"),
    @Index(name = "idx_patient_email", columnList = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String uhid; // e.g., "UHID-2026-8303"

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(length = 100)
    private String email;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(length = 10)
    private String gender; // Male, Female, Other

    private Integer age;

    @Column(length = 10)
    private String bloodGroup; // A+, B+, O+, AB+, etc.

    @Column(length = 20)
    private String emergencyContact;

    @Column(length = 255)
    private String address;

    @Column(nullable = false, length = 30)
    private String role; // "ROLE_PATIENT"

    @Column(nullable = false)
    private LocalDateTime registeredAt;
}
