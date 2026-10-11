package com.mediqueue.core.repository;

import com.mediqueue.core.entity.NotificationOutbox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationOutboxRepository extends JpaRepository<NotificationOutbox, Long> {
    List<NotificationOutbox> findByStatusAndScheduledAtLessThanEqualOrderByScheduledAtAsc(
            NotificationOutbox.DeliveryStatus status, LocalDateTime time);

    List<NotificationOutbox> findByTokenNumberOrderByCreatedAtDesc(String tokenNumber);

    List<NotificationOutbox> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    boolean existsByTokenNumberAndAlertType(String tokenNumber, NotificationOutbox.AlertType alertType);
}
