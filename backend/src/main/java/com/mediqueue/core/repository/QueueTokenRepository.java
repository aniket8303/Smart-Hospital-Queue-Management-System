package com.mediqueue.core.repository;

import com.mediqueue.core.entity.QueueToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface QueueTokenRepository extends JpaRepository<QueueToken, Long> {

    List<QueueToken> findByQueueDayAndStatusInOrderByPositionAsc(
        LocalDate queueDay, 
        List<QueueToken.QueueStatus> statuses
    );

    Optional<QueueToken> findByTokenNumberAndQueueDay(String tokenNumber, LocalDate queueDay);

    @Query("SELECT COUNT(q) FROM QueueToken q WHERE q.queueDay = :queueDay AND q.departmentId = :departmentId")
    long countTokensByDepartmentForDay(
        @Param("queueDay") LocalDate queueDay, 
        @Param("departmentId") Long departmentId
    );

    @Query("SELECT COUNT(q) FROM QueueToken q WHERE q.queueDay = :queueDay AND q.status = 'WAITING' AND q.departmentId = :departmentId AND q.position < :position")
    int countPatientsAhead(
        @Param("queueDay") LocalDate queueDay,
        @Param("departmentId") Long departmentId,
        @Param("position") Integer position
    );

    @Query("SELECT q FROM QueueToken q WHERE q.queueDay = :queueDay AND q.departmentId = :departmentId AND q.status = 'WAITING' ORDER BY q.position ASC")
    List<QueueToken> findWaitingQueueByDepartment(
        @Param("queueDay") LocalDate queueDay,
        @Param("departmentId") Long departmentId
    );

    List<QueueToken> findByQueueDayAndSource(LocalDate queueDay, QueueToken.TokenSource source);

    List<QueueToken> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    Optional<QueueToken> findByTokenNumber(String tokenNumber);

    Optional<QueueToken> findFirstByPatientIdAndStatusInOrderByCreatedAtDesc(
        Long patientId, 
        List<QueueToken.QueueStatus> statuses
    );
}
