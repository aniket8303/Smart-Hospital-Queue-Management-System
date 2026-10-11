# MediQueue — Production-Ready Smart Hospital Queue Management Platform

> **Hospital:** Diksha Hospital (OPD Wing A)  
> **Engineering Team:** CodeForge (Aniket Parekar, Gautam Kuwar, Tejas Kulkarni, Shubham Dhobhale)  
> **Core Architecture:** *"One Hospital. One Central Queue. Three Ways to Join."*

---

## 1. Executive Summary

**MediQueue** is an enterprise-grade hospital queue management and patient flow orchestration platform designed to eliminate OPD waiting room crowding, streamline clinical consultations, protect patient privacy, and deliver a frictionless healthcare experience.

Built for **Diksha Hospital**, MediQueue unifies every patient registration channel into **one authoritative, concurrency-safe central queue engine**:

| Intake Channel | Target Demographic | Token & Tracking Medium |
|---|---|---|
| 🏢 **Staff Reception Desk** | Walk-ins, elderly patients, patients without smartphones | Physical thermal printed slip with queue details |
| 📱 **Mobile Web & QR Portal** | Patients with smartphones arriving on-site or pre-registering | Digital live-updating mobile pass with SMS alerts |
| 🖥️ **Self-Service Kiosk** | Independent walk-ins preferring self-registration | Multi-language touchscreen with integrated card/UPI payment & print slip |

Regardless of how a patient enters, all tokens are sequenced by the same central database-backed queue engine. Receptionists, doctors, patients, and the public waiting-hall TV display always reflect the exact same consistent state.

---

## 2. Key Platform Features

### 🔒 Central Queue Engine & Concurrency Control
- **Atomic Token Sequencing:** Department-coded sequence numbers (`GM-042`, `CAR-015`, `ORT-009`) with database-level uniqueness constraints (`uk_day_token UNIQUE (queue_day, token_number)`).
- **Concurrency-Safe:** Tested against simultaneous high-concurrency requests with **0 duplicate tokens** generated.
- **Dynamic Waiting-Time Engine:** Accurately computes remaining time: $\text{EWT} = \text{Patients Ahead} \times \text{Avg Service Duration}$.
- **Deterministic State Transitions:** `WAITING` ➔ `NEXT` ➔ `IN_CONSULTATION` ➔ `COMPLETED` / `SKIPPED` / `CANCELLED`.

### 🛡️ Role-Based Access Control & Privacy
- **Strict Role Boundaries:** `PATIENT`, `STAFF` (Receptionist), `DOCTOR`, `ADMIN`, and restricted `KIOSK`.
- **Zero-Leakage Patient Isolation:** Object-level verification ensures patients can **never** view or alter another patient's medical history, appointments, payments, or tokens.
- **Anonymized Public Wall Display (`/queue-display`):** Shows currently called tokens and room assignments; patient names and phone numbers are completely redacted.

### 💳 Real Payment Subsystem
- **Authoritative Server Pricing:** Consultation fees are derived from backend doctor records (e.g. ₹300 for Dr. Priya Sharma).
- **HMAC-SHA256 Cryptographic Verification:** Client success callbacks are validated on the server via `orderId + "|" + paymentId` hash verification against the gateway secret.
- **Idempotent Webhooks:** Duplicate gateway webhook notifications are safely acknowledged without creating duplicate payments or tokens.

### 📲 Durable Notification Outbox & DLT SMS
- **Transactional Outbox:** Queue notifications are persisted within the database transaction, preventing message loss during provider outages.
- **Milestone Alerts:** Formatted for Indian TRAI DLT compliance (`REGISTRATION_CONFIRMED`, `TURN_15MIN`, `TURN_5MIN`, `NEXT_IN_LINE`, `TOKEN_CALLED`).
- **Asynchronous Dispatcher:** Polling worker with exponential backoff retry and obsolete message purging upon consultation completion or cancellation.

---

## 3. Technology Stack

### Frontend Tier
- **Framework:** Next.js 16.3.8 (App Router with Turbopack)
- **Language:** TypeScript 5.x
- **UI / Styling:** React 19, Tailwind CSS v4, Lucide React Icons
- **Animation & Motion:** Framer Motion v14
- **Printing:** Dedicated CSS print stylesheets for 80mm thermal receipts
- **Sound System:** Web Audio API hospital chime for token-called alerts

### Backend Tier
- **Runtime:** Java 17 / 21
- **Framework:** Spring Boot 3.2.4
- **Security:** Spring Security with JWT & Method-Level RBAC
- **Persistence:** Spring Data JPA, Hibernate ORM
- **Database:** MySQL 8.0 (Production) / In-Memory H2 (Local Demo Mode)
- **Migrations:** Flyway schema versioning
- **Gateways:** Razorpay Payment Gateway, Fast2SMS / DLT Telco SMS Gateway

---

## 4. Documentation Index

Detailed architectural and operational documentation is available in the repository:

- 📘 [**ARCHITECTURE.md**](file:///c:/Users/ANIKET/OneDrive/Desktop/Projects/Smart-Hospital-Queue-Management-System/ARCHITECTURE.md) — Comprehensive system topology, bounded contexts, domain models, and concurrency invariants.
- 💳 [**PAYMENT_INTEGRATION_GUIDE.md**](file:///c:/Users/ANIKET/OneDrive/Desktop/Projects/Smart-Hospital-Queue-Management-System/PAYMENT_INTEGRATION_GUIDE.md) — Razorpay setup, HMAC signature calculation, webhook idempotency, and test credentials.
- 📲 [**SMS_INTEGRATION_GUIDE.md**](file:///c:/Users/ANIKET/OneDrive/Desktop/Projects/Smart-Hospital-Queue-Management-System/SMS_INTEGRATION_GUIDE.md) — Fast2SMS gateway setup, Indian TRAI DLT template registration, outbox queue, and test procedures.
- 🗄️ [**DATABASE_OPERATIONS.md**](file:///c:/Users/ANIKET/OneDrive/Desktop/Projects/Smart-Hospital-Queue-Management-System/DATABASE_OPERATIONS.md) — MySQL 8 configuration, Flyway migrations, automated backup scripts, and disaster recovery.

---

## 5. Local Development Setup

### Prerequisites
- **Node.js** 20.x or higher
- **Java Development Kit (JDK)** 17 or 21
- **Apache Maven** 3.8+ (bundled in `backend/tools/apache-maven-3.9.9`)
- **MySQL 8** (Optional for local development; H2 is enabled by default)

### 1. Frontend Setup
```bash
# Clone the repository
git clone https://github.com/aniket8303/Smart-Hospital-Queue-Management-System.git
cd Smart-Hospital-Queue-Management-System

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Run Next.js development server
npm run dev
# Accessible at http://localhost:3000
```

### 2. Backend Setup
```bash
cd backend

# Build and verify all automated test suites
mvn clean test

# Run Spring Boot service
mvn spring-boot:run
# Backend REST API running at http://localhost:8080
```

---

## 6. Portals & Demo Walkthrough

| Portal | URL Route | Target Persona / Purpose |
|---|---|---|
| **Landing & Intake Overview** | `/` | Introduction, live queue counter, 3-mode selection |
| **Patient Mobile Portal** | `/patient` | Personal token tracking, estimated wait, SMS preferences |
| **Receptionist Desk** | `/staff` | Assisted patient registration, token slip printing |
| **Doctor Console** | `/doctor` | Consultation workflow: Call Next, Complete, Skip |
| **Hospital Admin Console** | `/admin` | Department configuration, doctor fees, audit logs |
| **Self-Service Kiosk** | `/kiosk` | Touchscreen walk-in terminal with payment & print |
| **Public Wall Display** | `/queue-display` | 16:9 Fullscreen TV display for waiting hall |
| **Authentication & Persona Switcher** | `/login` | 1-Click Persona switch for testing all roles |

---

## 7. Automated Test Suite Execution & Results

The system includes automated tests covering privacy, concurrency, state machines, payment signatures, and notification outbox milestones:

```bash
cd backend
mvn test
```

### Verified Test Summary (`16/16 Passed — BUILD SUCCESS`):

```
-------------------------------------------------------
 T E S T S
-------------------------------------------------------
Running com.mediqueue.core.PatientAuthorizationTest
Tests run: 8, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 2.115 s -- PASSED
  ✔ testPatientCanAccessOwnProfile
  ✔ testPatientCannotAccessOtherPatientProfile (IDOR Prevention)
  ✔ testPatientCannotAccessStaffEndpoint (403 Forbidden)
  ✔ testPatientCannotAccessDoctorEndpoint (403 Forbidden)
  ✔ testPatientCannotAccessAdminEndpoint (403 Forbidden)
  ✔ testUnauthenticatedRequestsRejected (401 Unauthorized)
  ✔ testPatientCanAccessOwnActiveToken
  ✔ testPatientCannotAccessOtherPatientToken

Running com.mediqueue.core.PlatformProductionWorkflowTest
Tests run: 8, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 3.421 s -- PASSED
  ✔ testThreeWaysToJoinCentralQueue (Reception, Web, Kiosk)
  ✔ testConcurrentQueueRegistration_ZeroDuplicates (10 parallel threads, 0 collisions)
  ✔ testQueueStateTransitions (WAITING -> NEXT -> IN_CONSULTATION -> COMPLETED)
  ✔ testPaymentVerification_HMACSignatureSuccess (Razorpay HMAC verified)
  ✔ testPaymentVerification_TamperedSignatureRejected (Forged signatures rejected)
  ✔ testPaymentWebhook_IdempotentHandling (Zero duplicate orders on replay)
  ✔ testNotificationOutbox_MilestonesScheduled (DLT milestones persisted)
  ✔ testWallDisplay_PrivacyEnforced (Patient PII stripped from public feed)

Results:
Tests run: 16, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## 8. Deployment Strategy

### Frontend Deployment (Vercel)
The Next.js frontend is structured for deployment on Vercel:
1. Connect GitHub repository to Vercel.
2. Set Build Command: `npm run build`.
3. Set Output Directory: `.next`.
4. Configure Environment Variables in Vercel:
   - `NEXT_PUBLIC_API_URL=https://api.dikshahospital.com`
   - `NEXT_PUBLIC_BASE_URL=https://mediqueue.dikshahospital.com`
   - `NEXT_PUBLIC_DEMO_MODE=false`
   - `NEXT_PUBLIC_DEMO_PAYMENT=false`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...`

### Backend Deployment (Docker / VPS / Managed Cloud)
1. Build production executable JAR:
   ```bash
   cd backend
   mvn clean package -DskipTests
   ```
2. Run JAR with production profile:
   ```bash
   java -jar target/mediqueue-core-service-2.0.0-SNAPSHOT.jar \
     --spring.profiles.active=prod
   ```
3. Required Production Environment Variables:
   - `MYSQL_URL=jdbc:mysql://db.dikshahospital.com:3306/mediqueue_db?useSSL=true`
   - `MYSQL_USER=mediqueue_app`
   - `MYSQL_PASSWORD=<STRONG_SECRET>`
   - `JWT_SECRET=<STRONG_256BIT_KEY>`
   - `RAZORPAY_KEY_ID=rzp_live_...`
   - `RAZORPAY_KEY_SECRET=<SECRET>`
   - `RAZORPAY_WEBHOOK_SECRET=<SECRET>`
   - `FAST2SMS_API_KEY=<SECRET>`

---

## 9. Team CodeForge

- **Aniket Parekar** — Lead Architect & Full-Stack Lead
- **Gautam Kuwar** — Frontend Engineer & Design Systems
- **Tejas Kulkarni** — Backend & Database Architect
- **Shubham Dhobhale** — UI/UX & Integration Specialist
