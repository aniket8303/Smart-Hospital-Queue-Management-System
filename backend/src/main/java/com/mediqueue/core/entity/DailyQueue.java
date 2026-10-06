package com.mediqueue.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_queues", uniqueConstraints = {
    @UniqueConstraint(columnNames = "queueDay")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyQueue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate queueDay; // e.g. 2026-10-06

    @Column(nullable = false)
    private Integer totalTokensIssued;

    @Column(nullable = false)
    private Integer activeTokensCount;

    @Column(nullable = false)
    private Integer completedTokensCount;

    @Column(nullable = false)
    private Boolean isKioskResetPerformed;

    private LocalDateTime initializedAt;

    private LocalDateTime resetAt;
}
