package com.mediqueue.core.service.notification;

import com.mediqueue.core.entity.NotificationOutbox;
import com.mediqueue.core.entity.QueueToken;

import java.util.List;
import java.util.Map;

public interface NotificationService {
    NotificationOutbox scheduleNotification(
            String tokenNumber, Long patientId, String phone,
            NotificationOutbox.AlertType alertType, String messageBody, int delayMinutes);

    void scheduleQueueMilestones(QueueToken token);

    void onTokenStatusChange(QueueToken token);

    void cancelPendingNotifications(String tokenNumber);

    int dispatchPendingNotifications();

    List<NotificationOutbox> getNotificationsByPatient(Long patientId);

    List<NotificationOutbox> getNotificationsByToken(String tokenNumber);

    Map<String, Object> getNotificationProviderStatus();
}
