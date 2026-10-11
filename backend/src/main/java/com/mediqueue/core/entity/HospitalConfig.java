package com.mediqueue.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hospital_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HospitalConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String hospitalName; // Diksha Hospital

    private String address;

    private String contactPhone;

    private String emergencyPhone;

    private String opdStartTime;

    private String opdEndTime;

    @Builder.Default
    private int averageConsultationMinutes = 5;

    @Builder.Default
    private boolean smsEnabled = true;

    @Builder.Default
    private boolean demoMode = true;

    @Builder.Default
    private String activePaymentProvider = "RAZORPAY";

    @Builder.Default
    private String activeSmsProvider = "FAST2SMS";
}
