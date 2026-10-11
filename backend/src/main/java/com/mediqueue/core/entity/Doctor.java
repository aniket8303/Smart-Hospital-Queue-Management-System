package com.mediqueue.core.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "doctors", indexes = {
    @Index(name = "idx_doctor_department", columnList = "departmentId"),
    @Index(name = "idx_doctor_available", columnList = "isAvailable")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String specialization;

    @Column(nullable = false)
    private Long departmentId;

    @Column(length = 100)
    private String departmentName;

    @Column(length = 50)
    private String roomNumber;

    @Column(nullable = false)
    private Boolean isAvailable = true;

    @Column(nullable = false)
    private Integer averageConsultationTimeMin = 5;

    @Column(nullable = false)
    private Double consultationFee = 300.0;

    @Column(length = 200)
    private String avatarUrl;
}
