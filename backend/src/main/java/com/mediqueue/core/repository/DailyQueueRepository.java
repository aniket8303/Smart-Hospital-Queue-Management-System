package com.mediqueue.core.repository;

import com.mediqueue.core.entity.DailyQueue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface DailyQueueRepository extends JpaRepository<DailyQueue, Long> {
    Optional<DailyQueue> findByQueueDay(LocalDate queueDay);
}
