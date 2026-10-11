package com.mediqueue.core.controller;

import com.mediqueue.core.entity.Patient;
import com.mediqueue.core.repository.PatientRepository;
import com.mediqueue.core.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final JwtUtil jwtUtil;
    private final PatientRepository patientRepository;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        String roleParam = request.getOrDefault("role", "patient").toLowerCase();
        String identifier = request.getOrDefault("identifier", "");

        Long userId;
        String username;
        String fullName;
        String roleAuthority;
        String uhid = null;
        String phone = null;

        if ("staff".equals(roleParam) || "receptionist".equals(roleParam)) {
            userId = 201L;
            username = "staff@mediqueue.org";
            fullName = "Sunita Rao";
            roleAuthority = "ROLE_RECEPTIONIST";
        } else if ("doctor".equals(roleParam)) {
            userId = 301L;
            username = "doctor@mediqueue.org";
            fullName = "Dr. Priya Sharma";
            roleAuthority = "ROLE_DOCTOR";
        } else if ("admin".equals(roleParam)) {
            userId = 401L;
            username = "admin@mediqueue.org";
            fullName = "Dr. Vikram Diksha";
            roleAuthority = "ROLE_ADMIN";
        } else {
            // Patient login
            Patient patient = null;
            if (identifier != null && !identifier.isEmpty()) {
                patient = patientRepository.findByPhone(identifier)
                        .or(() -> patientRepository.findByUhid(identifier))
                        .or(() -> patientRepository.findByEmail(identifier))
                        .orElse(null);
            }

            if (patient == null) {
                // Default demo patient: Aniket Parekar (Patient A)
                patient = patientRepository.findByUhid("UHID-2026-8303")
                        .orElseGet(() -> patientRepository.save(
                                Patient.builder()
                                        .uhid("UHID-2026-8303")
                                        .fullName("Aniket Parekar")
                                        .phone("+91 91234 56789")
                                        .email("aniket@mediqueue.org")
                                        .gender("Male")
                                        .age(28)
                                        .bloodGroup("B+")
                                        .emergencyContact("+91 98765 43210")
                                        .address("702 Emerald Heights, Diksha Hospital Road, Pune")
                                        .role("ROLE_PATIENT")
                                        .registeredAt(LocalDateTime.now())
                                        .build()
                        ));
            }

            userId = patient.getId();
            username = patient.getPhone();
            fullName = patient.getFullName();
            roleAuthority = "ROLE_PATIENT";
            uhid = patient.getUhid();
            phone = patient.getPhone();
        }

        String jwtToken = jwtUtil.generateToken(userId, username, roleAuthority, fullName, uhid, phone);

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwtToken);
        response.put("role", roleParam);
        response.put("roleAuthority", roleAuthority);

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", userId);
        userMap.put("username", username);
        userMap.put("fullName", fullName);
        userMap.put("role", roleParam);
        if (uhid != null) userMap.put("uhid", uhid);
        if (phone != null) userMap.put("phone", phone);
        response.put("user", userMap);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, Object> request) {
        String fullName = (String) request.getOrDefault("fullName", "Patient User");
        String phone = (String) request.getOrDefault("phone", "+91 90000 00000");
        String email = (String) request.get("email");
        String gender = (String) request.getOrDefault("gender", "Other");
        Integer age = request.get("age") instanceof Number ? ((Number) request.get("age")).intValue() : 30;

        String nextUhid = "UHID-2026-" + (1000 + (int)(Math.random() * 9000));

        Patient newPatient = Patient.builder()
                .uhid(nextUhid)
                .fullName(fullName)
                .phone(phone)
                .email(email)
                .gender(gender)
                .age(age)
                .role("ROLE_PATIENT")
                .registeredAt(LocalDateTime.now())
                .build();

        Patient saved = patientRepository.save(newPatient);

        String jwtToken = jwtUtil.generateToken(
                saved.getId(),
                saved.getPhone(),
                saved.getRole(),
                saved.getFullName(),
                saved.getUhid(),
                saved.getPhone()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwtToken);
        response.put("role", "patient");
        response.put("roleAuthority", "ROLE_PATIENT");
        response.put("user", saved);

        return ResponseEntity.ok(response);
    }
}
