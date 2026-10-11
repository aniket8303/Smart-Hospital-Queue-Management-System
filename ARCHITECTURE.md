# MediQueue — Enterprise Architecture & System Design

> **Platform:** MediQueue  
> **Initial Hospital:** Diksha Hospital (OPD Wing A)  
> **Engineering Team:** CodeForge (Aniket Parekar, Gautam Kuwar, Tejas Kulkarni, Shubham Dhobhale)  
> **Core Architecture:** "One Hospital. One Central Queue. Three Ways to Join."

---

## 1. Executive Summary & Product Vision

MediQueue is a production-grade hospital queue management and patient flow orchestration platform designed to eliminate reception congestion, optimize clinical throughput, and guarantee patient privacy.

Traditional hospitals suffer from two disjoint queues: the registration queue at the front desk, and the physical waiting queue outside the doctor's cabin. Patients repeatedly crowd the reception counter asking for status updates, token numbers, and remaining wait times.

MediQueue eliminates this friction by unifying all intake channels into a single, authoritative, concurrency-safe central queue:
1. **Receptionist-Assisted (Staff Desk):** For patients without smartphones, senior citizens, and walk-ins. Issues thermal physical printed slips.
2. **Mobile Web & QR-Based Self-Registration:** For mobile-equipped patients arriving on-site or pre-registering. Generates digital live-updating tracking passes.
3. **Self-Service Touchscreen Kiosk:** For walk-in patients preferring independent registration. Supports multi-language flows, instant card/UPI payments, and automated token printing with QR tracking.

Regardless of entry point, all tokens enter the exact same database-backed queue sequence, ensuring absolute fair ordering (FIFO with authorized clinical priority).

---

## 2. High-Level System Architecture

```
                       [ PATIENT BROWSERS & SMARTPHONES ]
                                       │
                       [ TOUCHSCREEN KIOSK TERMINALS ]
                                       │
                       [ STAFF DESK & DOCTOR CONSOLES ]
                                       │
                       [ PUBLIC WALL TV DISPLAYS ]
                                       │
                                       ▼ (HTTPS / WSS)
             ┌──────────────────────────────────────────────────┐
             │            Next.js 16 Edge / Web Tier           │
             │   - App Router Server Components & Actions       │
             │   - Client-Side Live State & Audio Chime System  │
             │   - Thermal Print Rendering (Print Stylesheets)  │
             └─────────────────────────┬────────────────────────┘
                                       │ REST / JWT Auth
                                       ▼
             ┌──────────────────────────────────────────────────┐
             │       Spring Boot 3.2.4 Central Core Engine      │
             │ ──────────────────────────────────────────────── │
             │  • Spring Security RBAC Filters & JWT Validation │
             │  • Atomic Token Generator & Sequence Concurrency │
             │  • Clinical Workflow & State Transition Engine   │
             │  • Privacy Isolation & Resource Authorizers      │
             │  • Payment Webhook & HMAC-SHA256 Signature Svc   │
             │  • Durable Notification Outbox Poller (@Scheduled)│
             └─────────────┬───────────────────────┬────────────┘
                           │                       │
           ┌───────────────▼────────┐      ┌───────▼─────────────────┐
           │ MySQL 8 / InnoDB Engine│      │ External Provider Gateways│
           │ ────────────────────── │      │ ────────────────────────│
           │ • 10 Production Tables │      │ • Razorpay / Payment API │
           │ • uk_day_token Uniq Key│      │ • Fast2SMS / DLT Telcos  │
           │ • ACID Tx & Row Locks  │      │ • SMTP / Web Push       │
           └────────────────────────┘      └─────────────────────────┘
```

---

## 3. Domain Boundaries & Modular Architecture

The application is structured into strict bounded domains inside `com.mediqueue.core`:

```
backend/src/main/java/com/mediqueue/core/
├── config/                  # CORS, WebMvc, Async, Scheduling configuration
├── controller/              # Role-segregated REST APIs
│   ├── AuthController.java        # Public signin, signup, token refresh
│   ├── StaffController.java       # RECEPTIONIST: Walk-ins, token printing, doctor schedules
│   ├── DoctorController.java      # DOCTOR: Call-next, complete consult, skip, vitals
│   ├── AdminController.java       # ADMIN: Hospital profile, doctor fees, audit logs, metrics
│   ├── DisplayController.java     # PUBLIC: TV wall display (anonymized feed)
│   ├── PaymentController.java     # PATIENT: Order init, client authorization, webhooks
│   └── PatientController.java     # PATIENT: Isolated profile, token pass, notifications
├── entity/                  # JPA / Hibernate entities with relational constraints
│   ├── HospitalConfig.java        # Runtime hospital parameters & timezone
│   ├── Department.java            # Hospital medical departments (A, CAR, ORT, PED)
│   ├── Doctor.java                # Medical staff, fees, room numbers, availability
│   ├── Patient.java               # Demographic records & UHID
│   ├── QueueToken.java            # Authoritative token record with unique day constraint
│   ├── QueueDay.java              # Daily queue metadata & sequencing counters
│   ├── PaymentOrder.java          # Server-side payment orders with idempotency
│   ├── PaymentTransaction.java    # Audited payment records & provider signatures
│   ├── NotificationOutbox.java    # Persistent SMS & notification dispatch queue
│   └── AuditEvent.java            # Immutable compliance audit log
├── repository/              # Spring Data JPA repositories with query locking
├── security/                # JWT filters, UserPrincipal, Method Security evaluators
└── service/                 # Domain business logic
    ├── QueueService.java          # Concurrency-safe token generation & transitions
    ├── payment/                   # Payment gateway abstraction & HMAC validation
    └── notification/              # DLT-compliant SMS gateway & background outbox dispatcher
```

---

## 4. Role-Based Access Control (RBAC) & Privacy Model

### 4.1 Strict Role Definitions

| Role | Permitted Operations | Access Restrictions |
|---|---|---|
| `PATIENT` | Read/write own profile, initiate payments, view own active token pass, view own medical history, download receipt. | **Strictly blocked** from viewing other patients' tokens, reading unassigned medical records, or executing queue transition endpoints (`call`, `complete`, `skip`). |
| `STAFF` (Receptionist) | Register walk-in patients, retrieve doctor availability, view department queues, generate thermal print slips. | Restricted to assigned department queues; cannot modify global hospital configuration or modify doctor consultation fees. |
| `DOCTOR` | Access assigned queue, view clinical vitals of current patient, advance queue (`CALL`, `COMPLETE`, `SKIP`). | Cannot access billing credentials or reconfigure hospital master settings. |
| `ADMIN` | Manage hospital profile, configure departments, adjust doctor consultation fees, audit logs, view financial reconciliation. | Access to all administrative and monitoring subsystems. |
| `KIOSK` | Restricted session: initiate patient registration, retrieve doctor fee, receive issued token slip. | Cannot browse patient directory, view historical data, or access clinical records. Self-resets after 60s idle. |

### 4.2 Object-Level Privacy Isolation

In compliance with healthcare security mandates, endpoint security does not rely merely on URL prefixes. Controllers evaluate the authenticated `UserPrincipal`:

```java
// Patient privacy verification
if (!patient.getId().equals(currentUser.getPatientId()) && !currentUser.hasRole("ADMIN")) {
    throw new AccessDeniedException("Access denied: You cannot view another patient's records");
}
```

This prevents Insecure Direct Object Reference (IDOR) attacks where a patient alters `?patientId=` or token parameters.

---

## 5. Central Queue Engine & Concurrency Control

### 5.1 Token Format Standard

Tokens follow standard department-coded sequencing:
- `GM-001`, `GM-002` (General Medicine — Code `GM` / `A`)
- `CAR-001`, `CAR-002` (Cardiology)
- `ORT-001`, `ORT-002` (Orthopedics)
- `PED-001`, `PED-002` (Pediatrics)
- `DRM-001`, `DRM-002` (Dermatology)

### 5.2 Atomic Sequence Generation & Duplicate Prevention

To guarantee zero duplicate tokens across concurrent requests (e.g., reception, mobile, and kiosk requesting simultaneously):
1. **Unique Database Constraint:**
   ```sql
   ALTER TABLE queue_tokens ADD CONSTRAINT uk_day_token UNIQUE (queue_day, token_number);
   ```
2. **Synchronized Queue Service Allocation:**
   The `QueueServiceImpl.createToken()` method coordinates allocation via an atomic counter lookup, transaction boundary (`@Transactional`), and catches data integrity violations with graceful retry or re-indexing.
3. **Automated Concurrency Verification:**
   Verified via `PlatformProductionWorkflowTest.testConcurrentQueueRegistration_ZeroDuplicates()`: 10 parallel threads executing simultaneous registration requests generate 10 unique, non-colliding token numbers with 0 duplicates.

### 5.3 Deterministic Queue State Machine

Tokens undergo strictly validated state transitions:

```
[ WAITING ] ────(Doctor calls next)────▶ [ NEXT ]
     │                                      │
     │ (Patient cancels)                    │ (Doctor invites into room)
     ▼                                      ▼
[ CANCELLED ]                         [ IN_CONSULTATION ]
                                            │
                                            ├──(Consultation finishes)──▶ [ COMPLETED ]
                                            │
                                            └──(Patient absent)─────────▶ [ SKIPPED ]
```

Invalid transitions (e.g. attempting to complete a token that is already completed, or skipping a cancelled token) throw validated `IllegalStateException` preventing corrupted queue states.

---

## 6. Estimated Waiting-Time (EWT) Model

The waiting-time estimation formula is computed dynamically at the server:

$$\text{Estimated Wait Time (minutes)} = \text{Patients Ahead in Queue} \times \text{Average Service Duration}$$

Where:
- $\text{Patients Ahead}$: Count of active tokens for the assigned doctor/department with status `WAITING` or `NEXT` sequenced prior to the subject token.
- $\text{Average Service Duration}$: Configurable per doctor or department (default: 5 minutes at Diksha Hospital).
- All patient-facing responses label this value explicitly: *"Estimated Wait Time (Approximate - Subject to clinical triage and doctor availability)"*.

---

## 7. Anonymized Public Wall Display (TV Display)

Hospital waiting halls require high-visibility queue screens without violating privacy laws.

The `DisplayController` exposes `GET /api/display/live`:
- **Included Data:** Department name, Doctor name, Room number, Currently Serving Token (`GM-042`), Next Serving Tokens (`GM-043`, `GM-044`), Queue Status (`ACTIVE`, `PAUSED`).
- **Strictly Redacted:** Patient names, phone numbers, ages, genders, medical complaints, and payment details are **completely excluded** from the payload.
- Designed with 16:9 fullscreen responsiveness, dark mode, high-contrast typography, and browser audio announcements for called tokens.

---

## 8. Financial Reconciliation & Payment Architecture

```
[ PATIENT / KIOSK ]                [ SPRING BOOT CORE ]                  [ RAZORPAY GATEWAY ]
        │                                   │                                     │
        │ 1. POST /api/payments/create-order│                                     │
        │──────────────────────────────────▶│ 2. Fetch Doctor Consultation Fee    │
        │                                   │ 3. Create Server Order (₹300)       │
        │                                   │────────────────────────────────────▶│
        │                                   │ 4. Order ID (order_diksha_xxx)      │
        │                                   │◀────────────────────────────────────│
        │ 5. Returns orderId & keyId        │                                     │
        │◀──────────────────────────────────│                                     │
        │                                                                         │
        │ 6. Complete UPI/Card in Razorpay Modal                                  │
        │────────────────────────────────────────────────────────────────────────▶│
        │ 7. Payment Signature (razorpay_payment_id, signature)                   │
        │◀────────────────────────────────────────────────────────────────────────│
        │                                                                         │
        │ 8. POST /api/payments/verify                                            │
        │──────────────────────────────────▶│ 9. Calculate HMAC-SHA256            │
        │                                   │    (orderId + "|" + paymentId, secret)
        │                                   │ 10. Signatures Match?               │
        │                                   │     - YES: Mark PAID, issue token   │
        │                                   │     - NO: Reject with 400 Bad Request
        │ 11. Return Confirmed Token & Rcpt │                                     │
        │◀──────────────────────────────────│                                     │
```

- **Zero Trust:** Client payment success callbacks are never accepted without cryptographic HMAC-SHA256 signature verification on the server.
- **Idempotency:** Webhook handling prevents duplicate credit or double token generation via `transactionId` and `orderId` indexing.

---

## 9. Durable Notification Outbox (Indian DLT SMS)

To guarantee that telco downtimes or network latency do not drop critical queue notifications:
1. **Transaction Outbox Pattern:** When a token is created, cancelled, or transitioned, pending milestones are persisted to `notification_outbox`.
2. **Milestones Supported:**
   - `REGISTRATION_CONFIRMED`: Token number, department, doctor, and room.
   - `TURN_15MIN`: Alert approximately 15 minutes before turn.
   - `TURN_5MIN`: Alert to proceed to waiting lounge.
   - `NEXT_IN_LINE`: Prepare to enter consultation cabin.
   - `TOKEN_CALLED`: Immediate announcement that doctor is ready.
3. **Scheduled Dispatcher:** An asynchronous background worker `@Scheduled(fixedDelay = 5000)` polls pending messages, calls the `SmsGateway`, and updates delivery states (`SENT`, `FAILED`) with exponential backoff retry.
4. **DLT Compliance:** Formatted to meet Indian Telecom Regulatory Authority (TRAI) template requirements.
