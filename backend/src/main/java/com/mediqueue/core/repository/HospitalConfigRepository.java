package com.mediqueue.core.repository;

import com.mediqueue.core.entity.HospitalConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HospitalConfigRepository extends JpaRepository<HospitalConfig, Long> {
    Optional<HospitalConfig> findByHospitalName(String hospitalName);
}
