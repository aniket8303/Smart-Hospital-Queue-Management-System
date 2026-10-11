package com.mediqueue.core.service.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Component("fast2SmsGateway")
@Slf4j
public class Fast2SmsGateway implements SmsGateway {

    @Value("${mediqueue.sms.fast2sms.api-key:}")
    private String apiKey;

    @Value("${mediqueue.sms.fast2sms.sender-id:MDIQUE}")
    private String senderId;

    @Value("${mediqueue.sms.live-mode:false}")
    private boolean liveMode;

    @Override
    public String getProviderName() {
        return "FAST2SMS_INDIA";
    }

    @Override
    public SmsDispatchResult sendSms(String phoneNumber, String messageBody, String dltTemplateId) {
        if (phoneNumber == null || phoneNumber.isBlank()) {
            return new SmsDispatchResult(false, null, "Phone number is empty");
        }

        // Clean phone number: remove non-digits, keep last 10 digits for Indian standard
        String digits = phoneNumber.replaceAll("\\D", "");
        if (digits.length() > 10 && digits.startsWith("91")) {
            digits = digits.substring(2);
        }

        if (digits.length() < 10) {
            return new SmsDispatchResult(false, null, "Invalid mobile number format: " + phoneNumber);
        }

        // If live API key is provided and live mode is active, execute real HTTP request to Fast2SMS
        if (apiKey != null && !apiKey.isBlank() && liveMode) {
            try {
                URL url = new URL("https://www.fast2sms.com/dev/bulkV2");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("authorization", apiKey);
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(5000);

                String payload = String.format(
                        "{\"route\":\"q\",\"message\":\"%s\",\"language\":\"english\",\"numbers\":\"%s\"}",
                        messageBody.replace("\"", "\\\""), digits
                );

                try (OutputStream os = conn.getOutputStream()) {
                    os.write(payload.getBytes(StandardCharsets.UTF_8));
                }

                int statusCode = conn.getResponseCode();
                if (statusCode >= 200 && statusCode < 300) {
                    String msgId = "f2s_" + System.currentTimeMillis();
                    log.info("Actual SMS dispatched successfully to +91 {} via Fast2SMS. Ref: {}", digits, msgId);
                    return new SmsDispatchResult(true, msgId, null);
                } else {
                    log.warn("Fast2SMS API returned error HTTP {}. Falling back to recorded audit.", statusCode);
                    return new SmsDispatchResult(false, null, "HTTP error from SMS gateway: " + statusCode);
                }
            } catch (Exception e) {
                log.error("Network exception connecting to SMS provider: {}", e.getMessage());
                return new SmsDispatchResult(false, null, "Network error: " + e.getMessage());
            }
        }

        // Otherwise (Test Mode / Pre-configured credentials): Log compliant DLT SMS with generated reference
        String simulatedMsgId = "sms_in_test_" + UUID.randomUUID().toString().substring(0, 10);
        log.info("[SMS-GATEWAY-TEST] To: +91 {} | Sender: {} | Body: '{}' | MsgId: {}", 
                digits, senderId, messageBody, simulatedMsgId);

        return new SmsDispatchResult(true, simulatedMsgId, null);
    }
}
