package com.mediqueue.core.repository;

import com.mediqueue.core.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByUhid(String uhid);
    Optional<Patient> findByPhone(String phone);
    Optional<Patient> findByEmail(String email);
}
