package com.mediqueue.core.controller;

import com.mediqueue.core.service.QueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/kiosk")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class KioskController {

    private final QueueService queueService;

    @PostMapping("/session")
    public ResponseEntity<Map<String, Object>> createSession(@RequestBody(required = false) Map<String, Object> body) {
        String sessionId = "KS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Map<String, Object> session = new HashMap<>();
        session.put("sessionId", sessionId);
        session.put("kioskId", "KIOSK-LOBBY-01");
        session.put("step", 1);
        session.put("language", body != null && body.containsKey("language") ? body.get("language") : "en");
        session.put("createdAt", LocalDateTime.now().toString());
        session.put("idleTimeoutSeconds", 60);
        return ResponseEntity.ok(session);
    }

    @PostMapping("/reset")
    public ResponseEntity<Map<String, Object>> dailyReset(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate queueDay) {
        LocalDate effectiveDay = queueDay != null ? queueDay : LocalDate.now();
        queueService.resetDailyQueue(effectiveDay);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "Kiosk daily session reset applied cleanly for queueDay " + effectiveDay);
        response.put("queueDay", effectiveDay.toString());
        response.put("kioskIdleReset", true);
        return ResponseEntity.ok(response);
    }
}
