package com.mediqueue.core.service;

import com.mediqueue.core.dto.TokenRequestDto;
import com.mediqueue.core.entity.AuditEvent;
import com.mediqueue.core.entity.DailyQueue;
import com.mediqueue.core.entity.Department;
import com.mediqueue.core.entity.Doctor;
import com.mediqueue.core.entity.QueueToken;
import com.mediqueue.core.repository.AuditEventRepository;
import com.mediqueue.core.repository.DailyQueueRepository;
import com.mediqueue.core.repository.DepartmentRepository;
import com.mediqueue.core.repository.DoctorRepository;
import com.mediqueue.core.repository.QueueTokenRepository;
import com.mediqueue.core.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class QueueServiceImpl implements QueueService {

    private final QueueTokenRepository tokenRepository;
    private final DailyQueueRepository dailyQueueRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final NotificationService notificationService;
    private final AuditEventRepository auditEventRepository;

    private static final int DEFAULT_SERVICE_TIME_MINUTES = 5;

    @Override
    @Transactional
    public synchronized QueueToken createToken(TokenRequestDto request) {
        LocalDate today = LocalDate.now();

        // 1. Ensure daily queue record exists
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

        // 2. Fetch authoritative doctor & department metadata
        String docName = request.getDoctorName();
        String roomNo = request.getRoomNumber();
        Double fee = request.getConsultationFee();
        int serviceDuration = DEFAULT_SERVICE_TIME_MINUTES;

        if (request.getDoctorId() != null) {
            Optional<Doctor> docOpt = doctorRepository.findById(request.getDoctorId());
            if (docOpt.isPresent()) {
                Doctor doc = docOpt.get();
                docName = doc.getName();
                if (roomNo == null || roomNo.isBlank()) roomNo = doc.getRoomNumber();
                if (fee == null) fee = doc.getConsultationFee();
                if (doc.getAverageConsultationTimeMin() != null) {
                    serviceDuration = doc.getAverageConsultationTimeMin();
                }
            }
        }

        String deptName = request.getDepartmentName();
        String deptCode = request.getDepartmentCode();
        if (request.getDepartmentId() != null) {
            Optional<Department> deptOpt = departmentRepository.findById(request.getDepartmentId());
            if (deptOpt.isPresent()) {
                Department dept = deptOpt.get();
                if (deptName == null || deptName.isBlank()) deptName = dept.getName();
                if (deptCode == null || deptCode.isBlank()) deptCode = dept.getCode();
            }
        }

        // 3. Generate department daily sequential token: e.g. A-001, A-042
        String codePrefix = deptCode != null && !deptCode.isEmpty() ? deptCode : "A";
        long currentDeptCount = tokenRepository.countTokensByDepartmentForDay(today, request.getDepartmentId());
        long nextSequence = currentDeptCount + 1;
        String generatedTokenNumber = String.format("%s-%03d", codePrefix, nextSequence);

        // 4. Calculate queue position & estimated wait
        List<QueueToken> waiting = tokenRepository.findWaitingQueueByDepartment(today, request.getDepartmentId());
        int position = waiting.size() + 1;
        int estimatedWait = (position - 1) * serviceDuration;

        QueueToken.TokenSource source = request.getSource() != null ? request.getSource() : QueueToken.TokenSource.RECEPTION;
        QueueToken.TokenType tokenType = request.getTokenType() != null ? request.getTokenType() : QueueToken.TokenType.PHYSICAL;

        QueueToken token = QueueToken.builder()
                .tokenNumber(generatedTokenNumber)
                .patientId(request.getPatientId() != null ? request.getPatientId() : 100L + nextSequence)
                .patientName(request.getPatientName())
                .patientAge(request.getPatientAge())
                .patientGender(request.getPatientGender())
                .patientPhone(request.getPatientPhone())
                .doctorId(request.getDoctorId())
                .doctorName(docName != null ? docName : "Dr. Priya Sharma")
                .departmentId(request.getDepartmentId())
                .departmentName(deptName != null ? deptName : "General Medicine")
                .roomNumber(roomNo != null ? roomNo : "Room 102")
                .queueDay(today)
                .position(position)
                .status(position == 1 ? QueueToken.QueueStatus.NEXT : QueueToken.QueueStatus.WAITING)
                .priority(QueueToken.Priority.NORMAL)
                .source(source)
                .tokenType(tokenType)
                .estimatedWaitMinutes(estimatedWait)
                .consultationFee(fee != null ? fee : 300.0)
                .transactionId(request.getTransactionId())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus("SUCCESS")
                .createdAt(LocalDateTime.now())
                .build();

        QueueToken saved = tokenRepository.save(token);

        // 5. Update daily metrics
        dailyQueue.setTotalTokensIssued(dailyQueue.getTotalTokensIssued() + 1);
        dailyQueue.setActiveTokensCount(dailyQueue.getActiveTokensCount() + 1);
        dailyQueueRepository.save(dailyQueue);

        // 6. Schedule durable SMS and in-app milestone notifications
        notificationService.scheduleQueueMilestones(saved);

        // 7. Audit Log
        auditEventRepository.save(AuditEvent.builder()
                .eventType("TOKEN_CREATED")
                .actorRole(source.name())
                .patientId(saved.getPatientId())
                .tokenNumber(saved.getTokenNumber())
                .details(String.format("Token %s issued via %s for %s (%s). Position: #%d, Est: ~%dm", 
                        saved.getTokenNumber(), source, saved.getDoctorName(), saved.getDepartmentName(), position, estimatedWait))
                .timestamp(LocalDateTime.now())
                .build());

        log.info("Successfully generated authoritative token {} for patient {} via {}", 
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
                notificationService.onTokenStatusChange(current);
            }
            tokenRepository.save(current);
        }

        QueueToken saved = tokenRepository.save(nextPatient);

        // Trigger SMS alert for called patient
        notificationService.onTokenStatusChange(saved);

        auditEventRepository.save(AuditEvent.builder()
                .eventType("TOKEN_CALLED")
                .actorRole("DOCTOR")
                .tokenNumber(saved.getTokenNumber())
                .patientId(saved.getPatientId())
                .details(String.format("Token %s called into %s", saved.getTokenNumber(), saved.getRoomNumber()))
                .timestamp(LocalDateTime.now())
                .build());

        return saved;
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

        notificationService.onTokenStatusChange(token);

        auditEventRepository.save(AuditEvent.builder()
                .eventType("CONSULTATION_COMPLETED")
                .actorRole("DOCTOR")
                .tokenNumber(token.getTokenNumber())
                .patientId(token.getPatientId())
                .details(String.format("Consultation completed for Token %s", token.getTokenNumber()))
                .timestamp(LocalDateTime.now())
                .build());

        return tokenRepository.save(token);
    }

    @Override
    @Transactional
    public QueueToken skipToken(String tokenNumber) {
        LocalDate today = LocalDate.now();
        QueueToken token = getQueueToken(tokenNumber, today);
        token.setStatus(QueueToken.QueueStatus.SKIPPED);

        notificationService.onTokenStatusChange(token);

        auditEventRepository.save(AuditEvent.builder()
                .eventType("TOKEN_SKIPPED")
                .actorRole("STAFF")
                .tokenNumber(token.getTokenNumber())
                .patientId(token.getPatientId())
                .details(String.format("Token %s skipped", token.getTokenNumber()))
                .timestamp(LocalDateTime.now())
                .build());

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
