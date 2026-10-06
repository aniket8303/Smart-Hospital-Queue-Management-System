package com.mediqueue.core.service;

import com.mediqueue.core.dto.TokenRequestDto;
import com.mediqueue.core.entity.DailyQueue;
import com.mediqueue.core.entity.QueueToken;
import com.mediqueue.core.repository.DailyQueueRepository;
import com.mediqueue.core.repository.QueueTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class QueueServiceImpl implements QueueService {

    private final QueueTokenRepository tokenRepository;
    private final DailyQueueRepository dailyQueueRepository;

    private static final int DEFAULT_SERVICE_TIME_MINUTES = 5;

    @Override
    @Transactional
    public synchronized QueueToken createToken(TokenRequestDto request) {
        LocalDate today = LocalDate.now();

        // Ensure daily queue record exists
        DailyQueue dailyQueue = dailyQueueRepository.findByQueueDay(today)
                .orElseGet(() -> dailyQueueRepository.save(
                        DailyQueue.builder()
                                .queueDay(today)
                                .totalTokensIssued(0)
                                .activeTokensCount(0)
                                .completedTokensCount(0)
                                .isKioskResetPerformed(false)
                                .initializedAt(LocalDateTime.now())
                                .build()
                ));

        // Generate department daily sequential token: e.g. A-001, A-042
        String codePrefix = request.getDepartmentCode() != null && !request.getDepartmentCode().isEmpty() 
                ? request.getDepartmentCode() 
                : "A";

        long currentDeptCount = tokenRepository.countTokensByDepartmentForDay(today, request.getDepartmentId());
        long nextSequence = currentDeptCount + 1;
        String generatedTokenNumber = String.format("%s-%03d", codePrefix, nextSequence);

        // Calculate queue position & estimated wait
        List<QueueToken> waiting = tokenRepository.findWaitingQueueByDepartment(today, request.getDepartmentId());
        int position = waiting.size() + 1;
        int estimatedWait = (position - 1) * DEFAULT_SERVICE_TIME_MINUTES;

        QueueToken token = QueueToken.builder()
                .tokenNumber(generatedTokenNumber)
                .patientId(request.getPatientId() != null ? request.getPatientId() : 100L + nextSequence)
                .patientName(request.getPatientName())
                .patientAge(request.getPatientAge())
                .patientGender(request.getPatientGender())
                .patientPhone(request.getPatientPhone())
                .doctorId(request.getDoctorId())
                .doctorName(request.getDoctorName())
                .departmentId(request.getDepartmentId())
                .departmentName(request.getDepartmentName())
                .roomNumber(request.getRoomNumber() != null ? request.getRoomNumber() : "Room 102")
                .queueDay(today)
                .position(position)
                .status(QueueToken.QueueStatus.WAITING)
                .priority(QueueToken.Priority.NORMAL)
                .source(request.getSource() != null ? request.getSource() : QueueToken.TokenSource.RECEPTION)
                .tokenType(request.getTokenType() != null ? request.getTokenType() : QueueToken.TokenType.PHYSICAL)
                .estimatedWaitMinutes(estimatedWait)
                .consultationFee(request.getConsultationFee() != null ? request.getConsultationFee() : 300.0)
                .transactionId(request.getTransactionId())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus("SUCCESS")
                .createdAt(LocalDateTime.now())
                .build();

        QueueToken saved = tokenRepository.save(token);

        // Update daily metrics
        dailyQueue.setTotalTokensIssued(dailyQueue.getTotalTokensIssued() + 1);
        dailyQueue.setActiveTokensCount(dailyQueue.getActiveTokensCount() + 1);
        dailyQueueRepository.save(dailyQueue);

        log.info("Successfully generated token {} for patient {} via {}", 
                saved.getTokenNumber(), saved.getPatientName(), saved.getSource());

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<QueueToken> getActiveQueue(LocalDate queueDay) {
        LocalDate queryDay = queueDay != null ? queueDay : LocalDate.now();
        return tokenRepository.findByQueueDayAndStatusInOrderByPositionAsc(
                queryDay, 
                Arrays.asList(
                        QueueToken.QueueStatus.IN_CONSULTATION, 
                        QueueToken.QueueStatus.NEXT, 
                        QueueToken.QueueStatus.WAITING
                )
        );
    }

    @Override
    @Transactional(readOnly = true)
    public QueueToken getQueueToken(String tokenNumber, LocalDate queueDay) {
        LocalDate queryDay = queueDay != null ? queueDay : LocalDate.now();
        return tokenRepository.findByTokenNumberAndQueueDay(tokenNumber, queryDay)
                .orElseThrow(() -> new IllegalArgumentException("Token not found: " + tokenNumber));
    }

    @Override
    @Transactional
    public QueueToken callNext(Long departmentId, Long doctorId) {
        LocalDate today = LocalDate.now();
        List<QueueToken> waitingTokens = tokenRepository.findWaitingQueueByDepartment(today, departmentId);

        if (waitingTokens.isEmpty()) {
            throw new IllegalStateException("No patients currently waiting in queue.");
        }

        QueueToken nextPatient = waitingTokens.get(0);
        nextPatient.setStatus(QueueToken.QueueStatus.IN_CONSULTATION);
        nextPatient.setCalledAt(LocalDateTime.now());
        nextPatient.setEstimatedWaitMinutes(0);

        // Update positions of remaining patients
        for (int i = 1; i < waitingTokens.size(); i++) {
            QueueToken current = waitingTokens.get(i);
            current.setPosition(i);
            current.setEstimatedWaitMinutes((i - 1) * DEFAULT_SERVICE_TIME_MINUTES);
            if (i == 1) {
                current.setStatus(QueueToken.QueueStatus.NEXT);
            }
            tokenRepository.save(current);
        }

        return tokenRepository.save(nextPatient);
    }

    @Override
    @Transactional
    public QueueToken completeConsultation(String tokenNumber) {
        LocalDate today = LocalDate.now();
        QueueToken token = getQueueToken(tokenNumber, today);
        token.setStatus(QueueToken.QueueStatus.COMPLETED);
        token.setCompletedAt(LocalDateTime.now());

        DailyQueue dailyQueue = dailyQueueRepository.findByQueueDay(today).orElse(null);
        if (dailyQueue != null) {
            dailyQueue.setActiveTokensCount(Math.max(0, dailyQueue.getActiveTokensCount() - 1));
            dailyQueue.setCompletedTokensCount(dailyQueue.getCompletedTokensCount() + 1);
            dailyQueueRepository.save(dailyQueue);
        }

        return tokenRepository.save(token);
    }

    @Override
    @Transactional
    public QueueToken skipToken(String tokenNumber) {
        LocalDate today = LocalDate.now();
        QueueToken token = getQueueToken(tokenNumber, today);
        token.setStatus(QueueToken.QueueStatus.SKIPPED);
        return tokenRepository.save(token);
    }

    @Override
    public int calculateEstimatedWait(Long departmentId, int position) {
        int patientsAhead = Math.max(0, position - 1);
        return patientsAhead * DEFAULT_SERVICE_TIME_MINUTES;
    }

    @Override
    @Transactional
    public void resetDailyQueue(LocalDate newQueueDay) {
        LocalDate effectiveDay = newQueueDay != null ? newQueueDay : LocalDate.now();
        dailyQueueRepository.findByQueueDay(effectiveDay).ifPresent(dq -> {
            dq.setIsKioskResetPerformed(true);
            dq.setResetAt(LocalDateTime.now());
            dailyQueueRepository.save(dq);
        });
        log.info("Daily queue reset acknowledged for date: {}", effectiveDay);
    }
}
