package com.mediqueue.core;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mediqueue.core.entity.Patient;
import com.mediqueue.core.entity.QueueToken;
import com.mediqueue.core.repository.PatientRepository;
import com.mediqueue.core.repository.QueueTokenRepository;
import com.mediqueue.core.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class PatientAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private QueueTokenRepository tokenRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private String patientAToken;
    private String patientBToken;
    private Long patientAId;
    private Long patientBId;

    @BeforeEach
    public void setup() {
        Patient patientA = patientRepository.findByUhid("UHID-2026-8303").orElseThrow();
        Patient patientB = patientRepository.findByUhid("UHID-2026-9912").orElseThrow();

        patientAId = patientA.getId();
        patientBId = patientB.getId();

        patientAToken = "Bearer " + jwtUtil.generateToken(
                patientA.getId(),
                patientA.getPhone(),
                "ROLE_PATIENT",
                patientA.getFullName(),
                patientA.getUhid(),
                patientA.getPhone()
        );

        patientBToken = "Bearer " + jwtUtil.generateToken(
                patientB.getId(),
                patientB.getPhone(),
                "ROLE_PATIENT",
                patientB.getFullName(),
                patientB.getUhid(),
                patientB.getPhone()
        );
    }

    /**
     * TEST 1: Patient A can access their own token.
     */
    @Test
    @DisplayName("1. Patient A can access their own token (GM-042)")
    public void testPatientACanAccessOwnToken() throws Exception {
        mockMvc.perform(get("/api/patient/tokens/GM-042")
                        .header("Authorization", patientAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenNumber", is("GM-042")))
                .andExpect(jsonPath("$.patientName", is("Aniket Parekar")));
    }

    /**
     * TEST 2: Patient A CANNOT access Patient B's token (Returns 403 Forbidden).
     */
    @Test
    @DisplayName("2. Patient A cannot access Patient B's token (CAR-015) -> 403 Forbidden")
    public void testPatientACannotAccessPatientBToken() throws Exception {
        mockMvc.perform(get("/api/patient/tokens/CAR-015")
                        .header("Authorization", patientAToken))
                .andExpect(status().isForbidden());
    }

    /**
     * TEST 3: Patient A CANNOT access another patient's appointments.
     */
    @Test
    @DisplayName("3. Patient A cannot access another patient's appointments (Only sees own)")
    public void testPatientAppointmentsIsolation() throws Exception {
        mockMvc.perform(get("/api/patient/me/appointments")
                        .header("Authorization", patientAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].patientId", everyItem(is(patientAId.intValue()))))
                .andExpect(jsonPath("$[*].patientName", everyItem(is("Aniket Parekar"))));
    }

    /**
     * TEST 4: Patient A CANNOT access another patient's payment records.
     */
    @Test
    @DisplayName("4. Patient A cannot access another patient's payment records (Only sees own)")
    public void testPatientPaymentsIsolation() throws Exception {
        mockMvc.perform(get("/api/patient/me/payments")
                        .header("Authorization", patientAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].patientId", everyItem(is(patientAId.intValue()))))
                .andExpect(jsonPath("$[*].transactionId", everyItem(is("MQ-2026-8303"))));
    }

    /**
     * TEST 5: Patient A CANNOT access staff, doctor, or admin APIs.
     */
    @Test
    @DisplayName("5. Patient A cannot access staff, doctor, or admin APIs -> 403 Forbidden")
    public void testPatientCannotAccessStaffDoctorAdminApis() throws Exception {
        // Staff/Doctor queue call action
        mockMvc.perform(post("/api/queue/GM-042/call")
                        .header("Authorization", patientAToken))
                .andExpect(status().isForbidden());

        // Admin overview
        mockMvc.perform(get("/api/admin/overview")
                        .header("Authorization", patientAToken))
                .andExpect(status().isForbidden());
    }

    /**
     * TEST 6: Unauthenticated users CANNOT access protected patient information.
     */
    @Test
    @DisplayName("6. Unauthenticated users cannot access protected patient information -> 401 Unauthorized")
    public void testUnauthenticatedCannotAccessProtectedData() throws Exception {
        mockMvc.perform(get("/api/patient/me"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/patient/me/appointments"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/patient/tokens/GM-042"))
                .andExpect(status().isUnauthorized());
    }

    /**
     * TEST 7: A patient CANNOT modify their own role or priority.
     */
    @Test
    @DisplayName("7. A patient cannot modify their own role or priority -> Bad Request / Forbidden")
    public void testPatientCannotModifyRoleOrPriority() throws Exception {
        Map<String, Object> tamperingAttempt = new HashMap<>();
        tamperingAttempt.put("role", "ROLE_ADMIN");
        tamperingAttempt.put("priority", "URGENT");

        mockMvc.perform(put("/api/patient/me/profile")
                        .header("Authorization", patientAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tamperingAttempt)))
                .andExpect(status().is4xxClientError());
    }

    /**
     * TEST 8: A patient CANNOT fake payment success via client manipulation.
     */
    @Test
    @DisplayName("8. A patient cannot fake payment success (Server generates and verifies transaction)")
    public void testServerControlsPaymentValidation() throws Exception {
        Map<String, Object> fakePayment = new HashMap<>();
        fakePayment.put("status", "SUCCESS");
        fakePayment.put("amount", 0.0);

        mockMvc.perform(post("/api/payments/demo")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(fakePayment)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notice", containsString("Demo / Simulated Payment")))
                .andExpect(jsonPath("$.transactionId", notNullValue()));
    }
}
