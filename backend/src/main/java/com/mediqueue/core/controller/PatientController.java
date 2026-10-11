package com.mediqueue.core.controller;

import com.mediqueue.core.dto.TokenRequestDto;
import com.mediqueue.core.entity.*;
import com.mediqueue.core.repository.*;
import com.mediqueue.core.security.UserPrincipal;
import com.mediqueue.core.service.QueueService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class PatientController {

    private final PatientRepository patientRepository;
    private final QueueTokenRepository tokenRepository;
    private final AppointmentRepository appointmentRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final PatientNotificationRepository notificationRepository;
    private final QueueService queueService;

    /**
     * Helper to get authenticated Patient entity from SecurityContext.
     */
    private Patient getAuthenticatedPatient(UserPrincipal principal) {
        if (principal == null || principal.getId() == null) {
            throw new AccessDeniedException("Authentication required.");
        }
        return patientRepository.findById(principal.getId())
                .orElseThrow(() -> new AccessDeniedException("Patient account not found."));
    }

    /**
     * GET /api/patient/me
     * Returns ONLY authenticated patient's personal profile.
     */
    @GetMapping("/me")
    public ResponseEntity<Patient> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        Patient patient = getAuthenticatedPatient(principal);
        return ResponseEntity.ok(patient);
    }

    /**
     * PUT /api/patient/me/profile
     * Updates permitted contact info (phone, emergencyContact, address).
     * Prevents role or priority alteration.
     */
    @PutMapping("/me/profile")
    public ResponseEntity<Patient> updateMyProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Object> updateRequest) {

        Patient patient = getAuthenticatedPatient(principal);

        // Security check: Reject attempts to escalate role or priority
        if (updateRequest.containsKey("role") && !patient.getRole().equals(updateRequest.get("role"))) {
            throw new IllegalArgumentException("Unauthorized: Cannot modify assigned user role.");
        }
        if (updateRequest.containsKey("priority")) {
            throw new IllegalArgumentException("Unauthorized: Clinical priority is controlled exclusively by triage staff.");
        }

        if (updateRequest.containsKey("phone")) {
            patient.setPhone((String) updateRequest.get("phone"));
        }
        if (updateRequest.containsKey("emergencyContact")) {
            patient.setEmergencyContact((String) updateRequest.get("emergencyContact"));
        }
        if (updateRequest.containsKey("address")) {
            patient.setAddress((String) updateRequest.get("address"));
        }

        Patient updated = patientRepository.save(patient);
        return ResponseEntity.ok(updated);
    }

    /**
     * GET /api/patient/me/tokens
     * Returns tokens belonging exclusively to the authenticated patient.
     */
    @GetMapping("/me/tokens")
    public ResponseEntity<List<QueueToken>> getMyTokens(@AuthenticationPrincipal UserPrincipal principal) {
        Patient patient = getAuthenticatedPatient(principal);
        List<QueueToken> tokens = tokenRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId());
        return ResponseEntity.ok(tokens);
    }

    /**
     * GET /api/patient/me/active-token
     * Returns current active queue item for the authenticated patient.
     */
    @GetMapping("/me/active-token")
    public ResponseEntity<Map<String, Object>> getMyActiveToken(@AuthenticationPrincipal UserPrincipal principal) {
        Patient patient = getAuthenticatedPatient(principal);
        Optional<QueueToken> activeOpt = tokenRepository.findFirstByPatientIdAndStatusInOrderByCreatedAtDesc(
                patient.getId(),
                Arrays.asList(QueueToken.QueueStatus.WAITING, QueueToken.QueueStatus.NEXT, QueueToken.QueueStatus.IN_CONSULTATION)
        );

        if (activeOpt.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyMap());
        }

        QueueToken active = activeOpt.get();
        // Recalculate live patients ahead & wait time
        int patientsAhead = tokenRepository.countPatientsAhead(active.getQueueDay(), active.getDepartmentId(), active.getPosition());
        int estimatedWait = patientsAhead * 5;

        Map<String, Object> response = new HashMap<>();
        response.put("token", active);
        response.put("patientsAhead", patientsAhead);
        response.put("estimatedWaitMinutes", estimatedWait);
        response.put("hospitalName", "Diksha Hospital");
        response.put("disclaimer", "Waiting times are estimates and may change according to consultation duration, emergency cases, and doctor availability.");

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/patient/tokens/{token}
     * Strict token verification: Patient can ONLY access their own token!
     * If token belongs to another patient, returns 403 Forbidden!
     */
    @GetMapping("/tokens/{token}")
    public ResponseEntity<QueueToken> getPatientToken(
            @PathVariable String token,
            @AuthenticationPrincipal UserPrincipal principal) {

        Patient patient = getAuthenticatedPatient(principal);
        LocalDate today = LocalDate.now();

        QueueToken queueToken = tokenRepository.findByTokenNumberAndQueueDay(token, today)
                .or(() -> tokenRepository.findByTokenNumber(token))
                .orElseThrow(() -> new IllegalArgumentException("Token not found: " + token));

        // STRICT AUTHORIZATION CHECK
        if (!queueToken.getPatientId().equals(patient.getId())) {
            log.warn("Security Alert: Patient {} attempted unauthorized access to Token {} owned by Patient {}",
                    patient.getId(), token, queueToken.getPatientId());
            throw new AccessDeniedException("Access Denied: You are not authorized to view or manage tokens belonging to another patient.");
        }

        return ResponseEntity.ok(queueToken);
    }

    /**
     * GET /api/patient/me/appointments
     * Returns appointments belonging exclusively to the authenticated patient.
     */
    @GetMapping("/me/appointments")
    public ResponseEntity<List<Appointment>> getMyAppointments(@AuthenticationPrincipal UserPrincipal principal) {
        Patient patient = getAuthenticatedPatient(principal);
        List<Appointment> appts = appointmentRepository.findByPatientIdOrderByScheduledTimeAsc(patient.getId());
        return ResponseEntity.ok(appts);
    }

    /**
     * GET /api/patient/me/payments
     * Returns payment records belonging exclusively to the authenticated patient.
     */
    @GetMapping("/me/payments")
    public ResponseEntity<List<PaymentRecord>> getMyPayments(@AuthenticationPrincipal UserPrincipal principal) {
        Patient patient = getAuthenticatedPatient(principal);
        List<PaymentRecord> payments = paymentRecordRepository.findByPatientIdOrderByPaidAtDesc(patient.getId());
        return ResponseEntity.ok(payments);
    }

    /**
     * GET /api/patient/me/notifications
     * Returns notifications belonging exclusively to the authenticated patient.
     */
    @GetMapping("/me/notifications")
    public ResponseEntity<List<PatientNotification>> getMyNotifications(@AuthenticationPrincipal UserPrincipal principal) {
        Patient patient = getAuthenticatedPatient(principal);
        List<PatientNotification> notifications = notificationRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId());
        return ResponseEntity.ok(notifications);
    }

    /**
     * POST /api/patient/queue/join
     * Safe queue joining using verified server-side patient profile.
     * Prevents duplicate active tokens.
     */
    @PostMapping("/queue/join")
    public ResponseEntity<?> joinQueue(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Object> joinRequest) {

        Patient patient = getAuthenticatedPatient(principal);

        // Idempotency / Duplicate submission check: If patient already has active token, prevent double queueing
        Optional<QueueToken> existingActive = tokenRepository.findFirstByPatientIdAndStatusInOrderByCreatedAtDesc(
                patient.getId(),
                Arrays.asList(QueueToken.QueueStatus.WAITING, QueueToken.QueueStatus.NEXT)
        );

        if (existingActive.isPresent()) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "DUPLICATE_QUEUE_NOT_ALLOWED");
            err.put("message", "You already have an active queue token (#" + existingActive.get().getTokenNumber() + ") at Diksha Hospital.");
            err.put("activeToken", existingActive.get());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
        }

        Long departmentId = ((Number) joinRequest.getOrDefault("departmentId", 1L)).longValue();
        Long doctorId = ((Number) joinRequest.getOrDefault("doctorId", 1L)).longValue();
        String reason = (String) joinRequest.getOrDefault("reason", "Outpatient Consultation");
        String paymentMethod = (String) joinRequest.getOrDefault("paymentMethod", "UPI");
        Double fee = joinRequest.get("fee") instanceof Number ? ((Number) joinRequest.get("fee")).doubleValue() : 300.0;

        TokenRequestDto dto = TokenRequestDto.builder()
                .patientId(patient.getId())
                .patientName(patient.getFullName())
                .patientPhone(patient.getPhone())
                .patientGender(patient.getGender())
                .patientAge(patient.getAge())
                .departmentId(departmentId)
                .doctorId(doctorId)
                .source(QueueToken.TokenSource.MOBILE)
                .tokenType(QueueToken.TokenType.DIGITAL)
                .consultationFee(fee)
                .paymentMethod(paymentMethod)
                .build();

        QueueToken createdToken = queueService.createToken(dto);

        // Generate verified payment record
        String txnId = "MQ-" + LocalDate.now().getYear() + "-" + (1000 + (int)(Math.random() * 9000));
        PaymentRecord paymentRecord = PaymentRecord.builder()
                .transactionId(txnId)
                .patientId(patient.getId())
                .patientName(patient.getFullName())
                .tokenNumber(createdToken.getTokenNumber())
                .doctorId(doctorId)
                .doctorName(createdToken.getDoctorName())
                .departmentId(departmentId)
                .departmentName(createdToken.getDepartmentName())
                .amount(fee)
                .paymentMethod(paymentMethod)
                .status("SUCCESS")
                .isDemo(true)
                .paidAt(LocalDateTime.now())
                .build();
        paymentRecordRepository.save(paymentRecord);

        // Generate in-app confirmation notification
        PatientNotification notif = PatientNotification.builder()
                .patientId(patient.getId())
                .title("Registered at Diksha Hospital")
                .message("Your token is " + createdToken.getTokenNumber() + ". Position: #" + createdToken.getPosition() + ". Estimated wait: ~" + createdToken.getEstimatedWaitMinutes() + " min.")
                .type("SUCCESS")
                .tokenNumber(createdToken.getTokenNumber())
                .isRead(false)
                .smsRecipient(patient.getPhone())
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notif);

        return ResponseEntity.ok(createdToken);
    }

    /**
     * POST /api/patient/queue/cancel
     * Allows patient to cancel their own active waiting token.
     */
    @PostMapping("/queue/cancel")
    public ResponseEntity<?> cancelMyQueue(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, String> cancelRequest) {

        Patient patient = getAuthenticatedPatient(principal);
        String tokenNumber = cancelRequest.get("tokenNumber");

        QueueToken token = tokenRepository.findByTokenNumber(tokenNumber)
                .orElseThrow(() -> new IllegalArgumentException("Token not found: " + tokenNumber));

        // Strict ownership check
        if (!token.getPatientId().equals(patient.getId())) {
            throw new AccessDeniedException("Unauthorized: Cannot cancel another patient's token.");
        }

        if (token.getStatus() != QueueToken.QueueStatus.WAITING) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Cannot cancel token that is already in consultation or completed."));
        }

        token.setStatus(QueueToken.QueueStatus.CANCELLED);
        tokenRepository.save(token);

        PatientNotification cancelNotif = PatientNotification.builder()
                .patientId(patient.getId())
                .title("Registration Cancelled")
                .message("Your token " + tokenNumber + " has been cancelled as requested.")
                .type("WARNING")
                .tokenNumber(tokenNumber)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(cancelNotif);

        return ResponseEntity.ok(Collections.singletonMap("status", "CANCELLED"));
    }
}
