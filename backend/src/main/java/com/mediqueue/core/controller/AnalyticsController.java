package com.mediqueue.core.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @GetMapping("/daily")
    public ResponseEntity<Map<String, Object>> getDailyAnalytics() {
        Map<String, Object> data = new HashMap<>();
        data.put("queueDay", "2026-10-06");
        data.put("totalTokens", 192);
        
        Map<String, Object> bySource = new HashMap<>();
        bySource.put("reception", 42);
        bySource.put("mobile", 67);
        bySource.put("kiosk", 83);
        data.put("tokenCreationBySource", bySource);

        Map<String, Object> avgProcessingTime = new HashMap<>();
        avgProcessingTime.put("receptionMinutes", 3.0);
        avgProcessingTime.put("mobileMinutes", 1.5);
        avgProcessingTime.put("kioskSeconds", 45);
        data.put("averageProcessingTime", avgProcessingTime);

        Map<String, Object> kioskTelemetry = new HashMap<>();
        kioskTelemetry.put("tokensGenerated", 83);
        kioskTelemetry.put("avgCompletionSeconds", 45);
        kioskTelemetry.put("paymentSuccessRate", 99.2);
        kioskTelemetry.put("abandonedSessionsCount", 3);
        kioskTelemetry.put("peakUsageHour", "10:00 AM - 11:30 AM");
        data.put("kioskTelemetry", kioskTelemetry);

        data.put("isSimulated", true);
        data.put("disclaimer", "Demo / Simulated Data for Hackathon evaluation.");

        return ResponseEntity.ok(data);
    }
}
