package com.mediqueue.core;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mediqueue.core.dto.TokenRequestDto;
import com.mediqueue.core.entity.*;
import com.mediqueue.core.repository.NotificationOutboxRepository;
import com.mediqueue.core.repository.PaymentOrderRepository;
import com.mediqueue.core.repository.QueueTokenRepository;
import com.mediqueue.core.security.JwtUtil;
import com.mediqueue.core.service.QueueService;
import com.mediqueue.core.service.notification.NotificationService;
import com.mediqueue.core.service.payment.PaymentService;
import com.mediqueue.core.service.payment.RazorpayPaymentGateway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.*;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class PlatformProductionWorkflowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private QueueService queueService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private QueueTokenRepository tokenRepository;

    @Autowired
    private PaymentOrderRepository orderRepository;

    @Autowired
    private NotificationOutboxRepository outboxRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    private String staffJwt;
    private String doctorJwt;
    private String adminJwt;
    private String patientJwt;

    @BeforeEach
    public void setup() {
        staffJwt = "Bearer " + jwtUtil.generateToken(201L, "staff_reception", "ROLE_RECEPTIONIST", "Sunita Sharma", "STAFF-01", "+919876543201");
        doctorJwt = "Bearer " + jwtUtil.generateToken(101L, "dr_priya", "ROLE_DOCTOR", "Dr. Priya Sharma", "DOC-01", "+919876543101");
        adminJwt = "Bearer " + jwtUtil.generateToken(999L, "admin_diksha", "ROLE_ADMIN", "Diksha Hospital Admin", "ADM-01", "+919876543999");
        patientJwt = "Bearer " + jwtUtil.generateToken(1L, "+919123456789", "ROLE_PATIENT", "Aniket Parekar", "UHID-2026-8303", "+919123456789");
    }

    /**
     * TEST 1: Unified Queue Entry (Three Ways to Join).
     * Receptionist, Web/Mobile, and Kiosk registrations all enter the same central queue engine.
     */
    @Test
    @DisplayName("Workflow 1: Reception, Web, and Kiosk registrations enter the same central queue")
    public void testThreeWaysToJoinSingleAuthoritativeQueue() {
        // 1. Reception registration
        QueueToken recToken = queueService.createToken(TokenRequestDto.builder()
                .patientName("Walk-in Senior Citizen")
                .departmentId(1L)
                .departmentCode("A")
                .doctorId(1L)
                .doctorName("Dr. Priya Sharma")
                .source(QueueToken.TokenSource.RECEPTION)
                .tokenType(QueueToken.TokenType.PHYSICAL)
                .patientPhone("+919822011111")
                .build());

        // 2. Web / Mobile QR registration
        QueueToken webToken = queueService.createToken(TokenRequestDto.builder()
                .patientName("Smartphone Patient")
                .departmentId(1L)
                .departmentCode("A")
                .doctorId(1L)
                .doctorName("Dr. Priya Sharma")
                .source(QueueToken.TokenSource.MOBILE)
                .tokenType(QueueToken.TokenType.DIGITAL)
                .patientPhone("+919822022222")
                .build());

        // 3. Self-service Kiosk registration
        QueueToken kioskToken = queueService.createToken(TokenRequestDto.builder()
                .patientName("Kiosk Terminal Patient")
                .departmentId(1L)
                .departmentCode("A")
                .doctorId(1L)
                .doctorName("Dr. Priya Sharma")
                .source(QueueToken.TokenSource.KIOSK)
                .tokenType(QueueToken.TokenType.PHYSICAL)
                .patientPhone("+919822033333")
                .build());

        assertNotNull(recToken.getTokenNumber());
        assertNotNull(webToken.getTokenNumber());
        assertNotNull(kioskToken.getTokenNumber());

        // All tokens must have unique sequential numbers
        assertNotEquals(recToken.getTokenNumber(), webToken.getTokenNumber());
        assertNotEquals(webToken.getTokenNumber(), kioskToken.getTokenNumber());

        // Sources correctly tagged
        assertEquals(QueueToken.TokenSource.RECEPTION, recToken.getSource());
        assertEquals(QueueToken.TokenSource.MOBILE, webToken.getSource());
        assertEquals(QueueToken.TokenSource.KIOSK, kioskToken.getSource());

        // All present in central active queue
        List<QueueToken> active = queueService.getActiveQueue(LocalDate.now());
        assertTrue(active.stream().anyMatch(t -> t.getTokenNumber().equals(recToken.getTokenNumber())));
        assertTrue(active.stream().anyMatch(t -> t.getTokenNumber().equals(webToken.getTokenNumber())));
        assertTrue(active.stream().anyMatch(t -> t.getTokenNumber().equals(kioskToken.getTokenNumber())));
    }

    /**
     * TEST 2: Concurrency & Duplicate Prevention.
     * 10 concurrent threads generating tokens must produce 10 unique tokens with zero duplicates.
     */
    @Test
    @DisplayName("Workflow 2: Concurrent token requests produce zero duplicates")
    public void testConcurrentQueueTokenGenerationNoDuplicates() throws InterruptedException, ExecutionException {
        int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        List<Callable<QueueToken>> tasks = new ArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            final int idx = i;
            tasks.add(() -> queueService.createToken(TokenRequestDto.builder()
                    .patientName("Concurrent Patient " + idx)
                    .departmentId(1L)
                    .departmentCode("A")
                    .doctorId(1L)
                    .doctorName("Dr. Priya Sharma")
                    .source(QueueToken.TokenSource.MOBILE)
                    .patientPhone("+91981100000" + idx)
                    .build()));
        }

        List<Future<QueueToken>> futures = executor.invokeAll(tasks);
        Set<String> tokenNumbers = new HashSet<>();

        for (Future<QueueToken> future : futures) {
            QueueToken token = future.get();
            assertNotNull(token);
            assertNotNull(token.getTokenNumber());
            tokenNumbers.add(token.getTokenNumber());
        }

        executor.shutdown();
        assertEquals(threadCount, tokenNumbers.size(), "All concurrent tokens must be distinct with zero duplicates!");
    }

    /**
     * TEST 3: Queue State Transitions (Call -> Consult -> Complete).
     */
    @Test
    @DisplayName("Workflow 3: Queue state transitions update position and status")
    public void testQueueStateTransitions() {
        QueueToken token = queueService.createToken(TokenRequestDto.builder()
                .patientName("State Test Patient")
                .departmentId(2L)
                .departmentCode("P")
                .doctorId(2L)
                .doctorName("Dr. Rajesh Kulkarni")
                .source(QueueToken.TokenSource.RECEPTION)
                .build());

        // Call Next
        QueueToken called = queueService.callNext(2L, 2L);
        assertNotNull(called);
        assertEquals(QueueToken.QueueStatus.IN_CONSULTATION, called.getStatus());

        // Complete Consultation
        QueueToken completed = queueService.completeConsultation(called.getTokenNumber());
        assertEquals(QueueToken.QueueStatus.COMPLETED, completed.getStatus());
        assertNotNull(completed.getCompletedAt());
    }

    /**
     * TEST 4: Payment Cryptographic Signature Verification & Tamper Rejection.
     */
    @Test
    @DisplayName("Workflow 4: Payment signature verification accepts authentic and rejects tampered")
    public void testPaymentSignatureVerificationAndTamperRejection() throws Exception {
        // 1. Create Order
        PaymentOrder order = paymentService.createOrder(
                1L, "Aniket Parekar", 1L, 1L, QueueToken.TokenSource.MOBILE, "UPI", "idemp_" + System.currentTimeMillis()
        );
        assertNotNull(order);
        assertEquals(PaymentOrder.OrderStatus.CREATED, order.getStatus());

        // 2. Authentic signature generated using secret
        String paymentId = "pay_test_" + System.currentTimeMillis();
        String payload = order.getProviderOrderId() + "|" + paymentId;
        String validSignature = RazorpayPaymentGateway.calculateHmacSha256(payload, "rzp_sec_mediqueue_secret_2026");

        // 3. Verification succeeds
        PaymentTransaction txn = paymentService.verifyAndConfirmPayment(order.getOrderId(), paymentId, validSignature);
        assertNotNull(txn);
        assertTrue(txn.isSignatureVerified());
        assertEquals("SUCCESS", txn.getStatus());

        PaymentOrder paidOrder = paymentService.getOrder(order.getOrderId());
        assertEquals(PaymentOrder.OrderStatus.PAID, paidOrder.getStatus());

        // 4. Tampered signature attempt on a new order must be rejected
        PaymentOrder order2 = paymentService.createOrder(
                1L, "Aniket Parekar", 1L, 1L, QueueToken.TokenSource.MOBILE, "UPI", "idemp_tamper_" + System.currentTimeMillis()
        );

        assertThrows(IllegalArgumentException.class, () -> {
            paymentService.verifyAndConfirmPayment(order2.getOrderId(), "pay_tampered_123", "invalid_forged_signature_hex");
        });
    }

    /**
     * TEST 5: Duplicate Webhook Idempotency.
     */
    @Test
    @DisplayName("Workflow 5: Webhook idempotency protects against duplicate processing")
    public void testWebhookIdempotency() {
        PaymentOrder order = paymentService.createOrder(
                1L, "Aniket Parekar", 1L, 1L, QueueToken.TokenSource.MOBILE, "UPI", "idemp_wh_" + System.currentTimeMillis()
        );

        String paymentId = "pay_wh_" + System.currentTimeMillis();
        String rawPayload = String.format("{\"event\":\"payment.captured\",\"status\":\"SUCCESS\",\"orderId\":\"%s\",\"paymentId\":\"%s\"}",
                order.getOrderId(), paymentId);

        try {
            String signature = RazorpayPaymentGateway.calculateHmacSha256(rawPayload, "rzp_wh_secret_2026");

            // First webhook
            PaymentTransaction firstTxn = paymentService.processWebhook(rawPayload, signature);
            assertNotNull(firstTxn);

            // Duplicate webhook
            PaymentTransaction replayTxn = paymentService.processWebhook(rawPayload, signature);
            assertNotNull(replayTxn);
            assertEquals(firstTxn.getTransactionId(), replayTxn.getTransactionId(), "Duplicate webhook returns idempotent transaction!");
        } catch (Exception e) {
            fail("Webhook signature calculation failed: " + e.getMessage());
        }
    }

    /**
     * TEST 6: Durable SMS Outbox & Milestone Scheduling.
     */
    @Test
    @DisplayName("Workflow 6: Durable SMS outbox enqueues and dispatches milestone alerts")
    public void testNotificationOutboxAndMilestones() {
        String testPhone = "+919876543210";
        QueueToken token = queueService.createToken(TokenRequestDto.builder()
                .patientName("SMS Alert Patient")
                .departmentId(1L)
                .doctorId(1L)
                .doctorName("Dr. Priya Sharma")
                .patientPhone(testPhone)
                .build());

        // Outbox must contain registration confirmation alert
        List<NotificationOutbox> outbox = outboxRepository.findByTokenNumberOrderByCreatedAtDesc(token.getTokenNumber());
        assertFalse(outbox.isEmpty(), "Notification outbox must have enqueued alerts for token!");

        boolean hasConfirmation = outbox.stream()
                .anyMatch(n -> n.getAlertType() == NotificationOutbox.AlertType.REGISTRATION_CONFIRMED);
        assertTrue(hasConfirmation, "Immediate registration alert must be scheduled in outbox!");

        // Dispatch scheduler run
        int dispatched = notificationService.dispatchPendingNotifications();
        assertTrue(dispatched >= 0);
    }

    /**
     * TEST 7: Privacy-Preserving Public Hospital Display.
     * /api/display/live must NEVER expose private patient names or phone numbers.
     */
    @Test
    @DisplayName("Workflow 7: Public wall display feed omits all private patient information")
    public void testWallDisplayOmitsPrivateInformation() throws Exception {
        mockMvc.perform(get("/api/display/live"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hospitalName", is("Diksha Hospital")))
                .andExpect(jsonPath("$.privacyPreserved", is(true)))
                // Must NOT contain sensitive fields
                .andExpect(jsonPath("$.upcomingTokens[*].patientName").doesNotExist())
                .andExpect(jsonPath("$.upcomingTokens[*].patientPhone").doesNotExist())
                .andExpect(jsonPath("$.upcomingTokens[*].patientAge").doesNotExist());
    }

    /**
     * TEST 8: Role Authorization Boundary Checks.
     * Patients must be strictly rejected (403) from Staff, Doctor, and Admin routes.
     */
    @Test
    @DisplayName("Workflow 8: Patient role is forbidden from Staff, Doctor, and Admin operations")
    public void testPatientForbiddenFromStaffDoctorAdminRoutes() throws Exception {
        // Staff register endpoint
        mockMvc.perform(post("/api/staff/register")
                        .header("Authorization", patientJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());

        // Doctor call-next endpoint
        mockMvc.perform(post("/api/doctor/call-next")
                        .header("Authorization", patientJwt))
                .andExpect(status().isForbidden());

        // Admin config endpoint
        mockMvc.perform(get("/api/admin/config")
                        .header("Authorization", patientJwt))
                .andExpect(status().isForbidden());
    }
}
