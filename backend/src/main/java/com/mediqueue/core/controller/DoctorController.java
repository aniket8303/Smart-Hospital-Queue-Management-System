package com.mediqueue.core.controller;

import com.mediqueue.core.entity.QueueToken;
import com.mediqueue.core.security.UserPrincipal;
import com.mediqueue.core.service.QueueService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class DoctorController {

    private final QueueService queueService;

    @GetMapping("/queue")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<List<QueueToken>> getDoctorQueue(
            @RequestParam(required = false) Long doctorId,
            @AuthenticationPrincipal UserPrincipal principal) {

        Long effectiveDocId = doctorId != null ? doctorId : 1L; // Dr. Priya Sharma default in demo
        List<QueueToken> active = queueService.getActiveQueue(LocalDate.now());
        List<QueueToken> doctorTokens = active.stream()
                .filter(t -> t.getDoctorId().equals(effectiveDocId))
                .toList();

        return ResponseEntity.ok(doctorTokens);
    }

    @PostMapping("/call-next")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<QueueToken> callNextPatient(
            @RequestParam(required = false, defaultValue = "1") Long departmentId,
            @RequestParam(required = false, defaultValue = "1") Long doctorId) {

        QueueToken called = queueService.callNext(departmentId, doctorId);
        log.info("Doctor called next patient: Token {}", called.getTokenNumber());
        return ResponseEntity.ok(called);
    }

    @PostMapping("/consultations/complete")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<QueueToken> completeConsultation(@RequestParam String tokenNumber) {
        QueueToken completed = queueService.completeConsultation(tokenNumber);
        log.info("Doctor completed consultation for Token {}", tokenNumber);
        return ResponseEntity.ok(completed);
    }

    @PostMapping("/consultations/skip")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<QueueToken> skipPatient(@RequestParam String tokenNumber) {
        QueueToken skipped = queueService.skipToken(tokenNumber);
        log.info("Doctor skipped patient Token {}", tokenNumber);
        return ResponseEntity.ok(skipped);
    }

    @GetMapping("/patients/{tokenNumber}/clinical-summary")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getPatientClinicalSummary(@PathVariable String tokenNumber) {
        QueueToken token = queueService.getQueueToken(tokenNumber, LocalDate.now());

        Map<String, Object> summary = new HashMap<>();
        summary.put("tokenNumber", token.getTokenNumber());
        summary.put("patientName", token.getPatientName());
        summary.put("patientAge", token.getPatientAge());
        summary.put("patientGender", token.getPatientGender());
        summary.put("vitals", Map.of(
                "bp", "120/80 mmHg",
                "pulse", "74 bpm",
                "temp", "98.6 F",
                "spO2", "99%"
        ));
        summary.put("chiefComplaint", "Outpatient clinical consultation");
        summary.put("status", token.getStatus().name());

        return ResponseEntity.ok(summary);
    }
}
