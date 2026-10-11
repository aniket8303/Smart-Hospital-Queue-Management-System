package com.mediqueue.core.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "departments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 100, unique = true)
    private String name;

    @NotBlank
    @Column(nullable = false, length = 10, unique = true)
    private String code; // e.g., GM, CAR, ORT, PED, DRM

    @Column(length = 200)
    private String description;

    @Column(length = 50)
    private String iconName;

    @Column(nullable = false)
    private Integer activeDoctors = 0;
}
