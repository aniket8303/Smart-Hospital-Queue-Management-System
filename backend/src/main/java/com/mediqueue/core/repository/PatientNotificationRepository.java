package com.mediqueue.core.repository;

import com.mediqueue.core.entity.PatientNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientNotificationRepository extends JpaRepository<PatientNotification, Long> {
    List<PatientNotification> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<PatientNotification> findByPatientIdAndIsReadFalseOrderByCreatedAtDesc(Long patientId);
}
