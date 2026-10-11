package com.mediqueue.core.controller;

import com.mediqueue.core.dto.TokenRequestDto;
import com.mediqueue.core.entity.QueueToken;
import com.mediqueue.core.service.QueueService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class StaffController {

    private final QueueService queueService;

    @PostMapping("/register")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'STAFF', 'ADMIN')")
    public ResponseEntity<QueueToken> registerWalkInPatient(@RequestBody TokenRequestDto request) {
        // Enforce registration source as RECEPTION
        request.setSource(QueueToken.TokenSource.RECEPTION);
        if (request.getTokenType() == null) {
            request.setTokenType(QueueToken.TokenType.PHYSICAL);
        }

        QueueToken token = queueService.createToken(request);
        log.info("Receptionist registered walk-in patient. Issued physical token {}", token.getTokenNumber());
        return ResponseEntity.ok(token);
    }

    @GetMapping("/queue")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'STAFF', 'ADMIN')")
    public ResponseEntity<List<QueueToken>> getDepartmentQueue(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String queueDay) {

        LocalDate day = queueDay != null ? LocalDate.parse(queueDay) : LocalDate.now();
        List<QueueToken> queue = queueService.getActiveQueue(day);

        if (departmentId != null) {
            queue = queue.stream()
                    .filter(t -> t.getDepartmentId().equals(departmentId))
                    .toList();
        }

        return ResponseEntity.ok(queue);
    }

    @GetMapping("/print-slip/{tokenNumber}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'STAFF', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getPrintSlipData(@PathVariable String tokenNumber) {
        QueueToken token = queueService.getQueueToken(tokenNumber, LocalDate.now());

        Map<String, Object> slip = new HashMap<>();
        slip.put("hospitalName", "Diksha Hospital");
        slip.put("tokenNumber", token.getTokenNumber());
        slip.put("patientName", token.getPatientName());
        slip.put("doctorName", token.getDoctorName());
        slip.put("departmentName", token.getDepartmentName());
        slip.put("roomNumber", token.getRoomNumber());
        slip.put("position", token.getPosition());
        slip.put("estimatedWaitMinutes", token.getEstimatedWaitMinutes());
        slip.put("consultationFee", token.getConsultationFee());
        slip.put("source", token.getSource().name());
        slip.put("issuedAt", token.getCreatedAt().toString());
        slip.put("instructions", "Please wait in OPD Lounge A. Watch the TV display for your token call.");

        return ResponseEntity.ok(slip);
    }
}
