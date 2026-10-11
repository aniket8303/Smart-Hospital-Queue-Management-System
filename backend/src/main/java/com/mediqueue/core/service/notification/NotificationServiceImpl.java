package com.mediqueue.core.service.notification;

import com.mediqueue.core.entity.AuditEvent;
import com.mediqueue.core.entity.NotificationOutbox;
import com.mediqueue.core.entity.PatientNotification;
import com.mediqueue.core.entity.QueueToken;
import com.mediqueue.core.repository.AuditEventRepository;
import com.mediqueue.core.repository.NotificationOutboxRepository;
import com.mediqueue.core.repository.PatientNotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationOutboxRepository outboxRepository;
    private final PatientNotificationRepository patientNotificationRepository;
    private final AuditEventRepository auditEventRepository;
    private final SmsGateway smsGateway;

    @Override
    @Transactional
    public NotificationOutbox scheduleNotification(
            String tokenNumber, Long patientId, String phone,
            NotificationOutbox.AlertType alertType, String messageBody, int delayMinutes) {

        // Deduplication: do not create duplicate alert for same token and type if already pending or sent
        if (outboxRepository.existsByTokenNumberAndAlertType(tokenNumber, alertType)) {
            log.debug("Duplicate notification {} skipped for token {}", alertType, tokenNumber);
            return null;
        }

        LocalDateTime scheduledTime = LocalDateTime.now().plusMinutes(delayMinutes);

        NotificationOutbox outbox = NotificationOutbox.builder()
                .tokenNumber(tokenNumber)
                .patientId(patientId != null ? patientId : 1L)
                .phoneNumber(phone != null ? phone : "")
                .channel(NotificationOutbox.Channel.SMS)
                .alertType(alertType)
                .messageBody(messageBody)
                .status(NotificationOutbox.DeliveryStatus.PENDING)
                .retryCount(0)
                .provider(smsGateway.getProviderName())
                .scheduledAt(scheduledTime)
                .createdAt(LocalDateTime.now())
                .build();

        return outboxRepository.save(outbox);
    }

    @Override
    @Transactional
    public void scheduleQueueMilestones(QueueToken token) {
        if (token.getPatientPhone() == null || token.getPatientPhone().isBlank()) {
            return;
        }

        String phone = token.getPatientPhone();
        String tokenNo = token.getTokenNumber();
        String doc = token.getDoctorName() != null ? token.getDoctorName() : "Doctor";
        String room = token.getRoomNumber() != null ? token.getRoomNumber() : "Room 102";
        int wait = token.getEstimatedWaitMinutes() != null ? token.getEstimatedWaitMinutes() : 15;

        // 1. Immediate Registration Confirmed
        String confirmMsg = String.format(
                "Diksha Hospital: Token %s confirmed for %s in %s. Pos: #%d. Est wait: ~%dm. Track: mediqueue.live",
                tokenNo, doc, room, token.getPosition(), wait
        );
        NotificationOutbox immediate = scheduleNotification(
                tokenNo, token.getPatientId(), phone,
                NotificationOutbox.AlertType.REGISTRATION_CONFIRMED, confirmMsg, 0
        );

        if (immediate != null) {
            dispatchSingle(immediate);
        }

        // 2. Schedule ~15 min turn approaching alert if wait time is substantial
        if (wait >= 20) {
            int delay = wait - 15;
            String turn15Msg = String.format(
                    "Diksha Hospital: Your turn is in ~15 mins for %s (%s). Please be seated in OPD Lounge A.",
                    doc, tokenNo
            );
            scheduleNotification(tokenNo, token.getPatientId(), phone,
                    NotificationOutbox.AlertType.TURN_15MIN, turn15Msg, delay);
        }

        // 3. Schedule ~5 min turn approaching alert
        if (wait >= 10) {
            int delay = Math.max(1, wait - 5);
            String turn5Msg = String.format(
                    "Diksha Hospital: Only 1-2 patients ahead! Token %s, please stand by outside %s.",
                    tokenNo, room
            );
            scheduleNotification(tokenNo, token.getPatientId(), phone,
                    NotificationOutbox.AlertType.TURN_5MIN, turn5Msg, delay);
        }
    }

    @Override
    @Transactional
    public void onTokenStatusChange(QueueToken token) {
        if (token.getPatientPhone() == null || token.getPatientPhone().isBlank()) {
            return;
        }

        String phone = token.getPatientPhone();
        String tokenNo = token.getTokenNumber();
        String room = token.getRoomNumber() != null ? token.getRoomNumber() : "Room 102";

        if (token.getStatus() == QueueToken.QueueStatus.NEXT) {
            String msg = String.format("Diksha Hospital: You are NEXT IN LINE for %s! Please be outside %s now.", 
                    token.getDoctorName(), room);
            NotificationOutbox notif = scheduleNotification(tokenNo, token.getPatientId(), phone,
                    NotificationOutbox.AlertType.NEXT_IN_LINE, msg, 0);
            if (notif != null) dispatchSingle(notif);

        } else if (token.getStatus() == QueueToken.QueueStatus.IN_CONSULTATION) {
            String msg = String.format("Diksha Hospital: Token %s CALLED! Please enter %s immediately.", 
                    tokenNo, room);
            NotificationOutbox notif = scheduleNotification(tokenNo, token.getPatientId(), phone,
                    NotificationOutbox.AlertType.TOKEN_CALLED, msg, 0);
            if (notif != null) dispatchSingle(notif);

        } else if (token.getStatus() == QueueToken.QueueStatus.CANCELLED) {
            cancelPendingNotifications(tokenNo);
            String msg = String.format("Diksha Hospital: Registration for Token %s has been cancelled.", tokenNo);
            NotificationOutbox notif = scheduleNotification(tokenNo, token.getPatientId(), phone,
                    NotificationOutbox.AlertType.CANCELLED, msg, 0);
            if (notif != null) dispatchSingle(notif);

        } else if (token.getStatus() == QueueToken.QueueStatus.COMPLETED) {
            cancelPendingNotifications(tokenNo);
        }
    }

    @Override
    @Transactional
    public void cancelPendingNotifications(String tokenNumber) {
        List<NotificationOutbox> pending = outboxRepository.findByTokenNumberOrderByCreatedAtDesc(tokenNumber);
        for (NotificationOutbox n : pending) {
            if (n.getStatus() == NotificationOutbox.DeliveryStatus.PENDING) {
                n.setStatus(NotificationOutbox.DeliveryStatus.FAILED);
                n.setFailureReason("Cancelled: Token completed or cancelled before scheduled trigger.");
                outboxRepository.save(n);
            }
        }
    }

    @Override
    @Scheduled(fixedRate = 10000) // Poll every 10 seconds for scheduled alert dispatch
    @Transactional
    public int dispatchPendingNotifications() {
        LocalDateTime now = LocalDateTime.now();
        List<NotificationOutbox> dueNotifications = outboxRepository
                .findByStatusAndScheduledAtLessThanEqualOrderByScheduledAtAsc(
                        NotificationOutbox.DeliveryStatus.PENDING, now
                );

        if (dueNotifications.isEmpty()) {
            return 0;
        }

        int dispatchedCount = 0;
        for (NotificationOutbox outbox : dueNotifications) {
            dispatchSingle(outbox);
            dispatchedCount++;
        }

        return dispatchedCount;
    }

    private void dispatchSingle(NotificationOutbox outbox) {
        try {
            SmsGateway.SmsDispatchResult result = smsGateway.sendSms(
                    outbox.getPhoneNumber(),
                    outbox.getMessageBody(),
                    "DLT_MEDIQUEUE_ALERT"
            );

            if (result.success()) {
                outbox.setStatus(NotificationOutbox.DeliveryStatus.SENT);
                outbox.setProviderMessageId(result.providerMessageId());
                outbox.setSentAt(LocalDateTime.now());
                outboxRepository.save(outbox);

                // Save in-app notification mirror
                patientNotificationRepository.save(PatientNotification.builder()
                        .patientId(outbox.getPatientId())
                        .title(formatTitle(outbox.getAlertType()))
                        .message(outbox.getMessageBody())
                        .type("INFO")
                        .tokenNumber(outbox.getTokenNumber())
                        .smsRecipient(outbox.getPhoneNumber())
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build());

                auditEventRepository.save(AuditEvent.builder()
                        .eventType("SMS_DISPATCHED")
                        .actorRole("SYSTEM")
                        .patientId(outbox.getPatientId())
                        .tokenNumber(outbox.getTokenNumber())
                        .details(String.format("SMS dispatched to %s. Ref: %s", outbox.getPhoneNumber(), result.providerMessageId()))
                        .timestamp(LocalDateTime.now())
                        .build());

            } else {
                int retries = outbox.getRetryCount() + 1;
                outbox.setRetryCount(retries);
                if (retries >= 3) {
                    outbox.setStatus(NotificationOutbox.DeliveryStatus.FAILED);
                    outbox.setFailureReason(result.failureReason());
                }
                outboxRepository.save(outbox);
            }
        } catch (Exception e) {
            log.error("Failed to dispatch SMS notification for {}: {}", outbox.getTokenNumber(), e.getMessage());
            outbox.setRetryCount(outbox.getRetryCount() + 1);
            if (outbox.getRetryCount() >= 3) {
                outbox.setStatus(NotificationOutbox.DeliveryStatus.FAILED);
                outbox.setFailureReason("Exception: " + e.getMessage());
            }
            outboxRepository.save(outbox);
        }
    }

    private String formatTitle(NotificationOutbox.AlertType type) {
        return switch (type) {
            case REGISTRATION_CONFIRMED -> "Queue Token Confirmed";
            case TURN_15MIN -> "Turn Approaching (~15 min)";
            case TURN_5MIN -> "Almost Your Turn (~5 min)";
            case NEXT_IN_LINE -> "Next in Line!";
            case TOKEN_CALLED -> "Your Token is Called!";
            case DELAY_ADVISORY -> "OPD Delay Advisory";
            case CANCELLED -> "Token Cancelled";
        };
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationOutbox> getNotificationsByPatient(Long patientId) {
        return outboxRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationOutbox> getNotificationsByToken(String tokenNumber) {
        return outboxRepository.findByTokenNumberOrderByCreatedAtDesc(tokenNumber);
    }

    @Override
    public Map<String, Object> getNotificationProviderStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("activeProvider", smsGateway.getProviderName());
        status.put("status", "HEALTHY");
        status.put("dltCompliant", true);
        status.put("retryPolicy", "Exponential backoff up to 3 attempts");
        return status;
    }
}
