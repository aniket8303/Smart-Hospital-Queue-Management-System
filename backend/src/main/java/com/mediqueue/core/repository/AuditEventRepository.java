package com.mediqueue.core.repository;

import com.mediqueue.core.entity.AuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {
    List<AuditEvent> findTop100ByOrderByTimestampDesc();
    List<AuditEvent> findByEventTypeOrderByTimestampDesc(String eventType);
}
