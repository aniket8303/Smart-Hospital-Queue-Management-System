package com.mediqueue.core.controller;

import com.mediqueue.core.entity.AuditEvent;
import com.mediqueue.core.entity.Doctor;
import com.mediqueue.core.entity.HospitalConfig;
import com.mediqueue.core.repository.AuditEventRepository;
import com.mediqueue.core.repository.DoctorRepository;
import com.mediqueue.core.repository.HospitalConfigRepository;
import com.mediqueue.core.service.payment.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class AdminController {

    private final AuditEventRepository auditEventRepository;
    private final HospitalConfigRepository hospitalConfigRepository;
    private final DoctorRepository doctorRepository;
    private final PaymentService paymentService;

    @GetMapping("/audit-logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditEvent>> getRecentAuditLogs() {
        return ResponseEntity.ok(auditEventRepository.findTop100ByOrderByTimestampDesc());
    }

    @GetMapping("/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HospitalConfig> getHospitalConfig() {
        HospitalConfig config = hospitalConfigRepository.findByHospitalName("Diksha Hospital")
                .orElseGet(() -> hospitalConfigRepository.save(
                        HospitalConfig.builder()
                                .hospitalName("Diksha Hospital")
                                .address("Senapati Bapat Road, Shivajinagar, Pune, Maharashtra 411016")
                                .contactPhone("+91 20 2567 8900")
                                .emergencyPhone("+91 20 2567 8999")
                                .opdStartTime("08:00")
                                .opdEndTime("20:00")
                                .averageConsultationMinutes(5)
                                .smsEnabled(true)
                                .demoMode(true)
                                .activePaymentProvider("RAZORPAY")
                                .activeSmsProvider("FAST2SMS")
                                .build()
                ));
        return ResponseEntity.ok(config);
    }

    @PutMapping("/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HospitalConfig> updateHospitalConfig(@RequestBody HospitalConfig updated) {
        HospitalConfig current = hospitalConfigRepository.findByHospitalName("Diksha Hospital")
                .orElse(updated);
        current.setOpdStartTime(updated.getOpdStartTime());
        current.setOpdEndTime(updated.getOpdEndTime());
        current.setAverageConsultationMinutes(updated.getAverageConsultationMinutes());
        current.setSmsEnabled(updated.isSmsEnabled());
        current.setActivePaymentProvider(updated.getActivePaymentProvider());
        current.setActiveSmsProvider(updated.getActiveSmsProvider());

        return ResponseEntity.ok(hospitalConfigRepository.save(current));
    }

    @PutMapping("/doctors/{id}/availability")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Doctor> updateDoctorAvailability(@PathVariable Long id, @RequestParam boolean available) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found: " + id));
        doctor.setIsAvailable(available);
        Doctor saved = doctorRepository.save(doctor);
        log.info("Admin updated Doctor {} availability to {}", doctor.getName(), available);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/doctors/{id}/fee")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Doctor> updateDoctorFee(@PathVariable Long id, @RequestParam Double fee) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found: " + id));
        doctor.setConsultationFee(fee);
        Doctor saved = doctorRepository.save(doctor);
        log.info("Admin updated Doctor {} consultation fee to ₹{}", doctor.getName(), fee);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/metrics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSystemMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("hospital", "Diksha Hospital");
        metrics.put("activeDoctorsOnDuty", doctorRepository.findByIsAvailableTrue().size());
        metrics.put("paymentGatewayStatus", paymentService.getPaymentProviderStatus());
        metrics.put("serverStatus", "OPERATIONAL_HEALTHY");
        metrics.put("securityRBAC", "STRICT_ACTIVE");
        return ResponseEntity.ok(metrics);
    }
}
