package com.mediqueue.core.service.notification;

public interface SmsGateway {
    String getProviderName();
    SmsDispatchResult sendSms(String phoneNumber, String messageBody, String dltTemplateId);

    record SmsDispatchResult(boolean success, String providerMessageId, String failureReason) {}
}
