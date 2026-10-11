package com.mediqueue.core.repository;

import com.mediqueue.core.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientIdOrderByScheduledTimeAsc(Long patientId);
    List<Appointment> findByDoctorIdOrderByScheduledTimeAsc(Long doctorId);
}
