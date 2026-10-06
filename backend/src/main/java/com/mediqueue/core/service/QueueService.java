package com.mediqueue.core.service;

import com.mediqueue.core.dto.TokenRequestDto;
import com.mediqueue.core.entity.QueueToken;

import java.time.LocalDate;
import java.util.List;

public interface QueueService {
    QueueToken createToken(TokenRequestDto request);
    List<QueueToken> getActiveQueue(LocalDate queueDay);
    QueueToken getQueueToken(String tokenNumber, LocalDate queueDay);
    QueueToken callNext(Long departmentId, Long doctorId);
    QueueToken completeConsultation(String tokenNumber);
    QueueToken skipToken(String tokenNumber);
    int calculateEstimatedWait(Long departmentId, int position);
    void resetDailyQueue(LocalDate newQueueDay);
}
