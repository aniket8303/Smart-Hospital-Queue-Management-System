package com.mediqueue.core.controller;

import com.mediqueue.core.dto.TokenRequestDto;
import com.mediqueue.core.entity.QueueToken;
import com.mediqueue.core.service.QueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/queue")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QueueController {

    private final QueueService queueService;

    @PostMapping("/tokens")
    public ResponseEntity<QueueToken> createToken(@RequestBody TokenRequestDto request) {
        QueueToken token = queueService.createToken(request);
        return ResponseEntity.ok(token);
    }

    @GetMapping("/active")
    public ResponseEntity<List<QueueToken>> getActiveQueue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate queueDay) {
        List<QueueToken> active = queueService.getActiveQueue(queueDay);
        return ResponseEntity.ok(active);
    }

    @GetMapping("/{token}")
    public ResponseEntity<QueueToken> getQueueToken(
            @PathVariable String token,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate queueDay) {
        QueueToken queueToken = queueService.getQueueToken(token, queueDay);
        return ResponseEntity.ok(queueToken);
    }

    @PostMapping("/{token}/call")
    public ResponseEntity<QueueToken> callNext(
            @PathVariable String token,
            @RequestParam Long departmentId,
            @RequestParam Long doctorId) {
        QueueToken called = queueService.callNext(departmentId, doctorId);
        return ResponseEntity.ok(called);
    }

    @PostMapping("/{token}/complete")
    public ResponseEntity<QueueToken> completeConsultation(@PathVariable String token) {
        QueueToken completed = queueService.completeConsultation(token);
        return ResponseEntity.ok(completed);
    }

    @PostMapping("/{token}/skip")
    public ResponseEntity<QueueToken> skipToken(@PathVariable String token) {
        QueueToken skipped = queueService.skipToken(token);
        return ResponseEntity.ok(skipped);
    }

    @GetMapping("/estimate")
    public ResponseEntity<Map<String, Object>> getEstimatedWait(
            @RequestParam Long departmentId,
            @RequestParam int position) {
        int estimatedMinutes = queueService.calculateEstimatedWait(departmentId, position);
        Map<String, Object> response = new HashMap<>();
        response.put("departmentId", departmentId);
        response.put("position", position);
        response.put("estimatedWaitMinutes", estimatedMinutes);
        return ResponseEntity.ok(response);
    }
}
