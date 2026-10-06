# MediQueue 2.0 — Enterprise Microservices & Spring Boot Architecture

> **Team:** CodeForge  
> **Tagline:** *"Smart Queues. Shorter Waits. Better Care."*  
> **Core Innovation:** **"ONE QUEUE. THREE WAYS TO JOIN."** (Assisted Physical Token, Digital Mobile Token, Self-Service Kiosk)

---

## 1. System Topology Overview

```
                      INTERNET / INTRANET
                              │
               ┌──────────────▼──────────────┐
               │    Spring Cloud Gateway     │
               │      (Rate Limiting &       │
               │       JWT Forwarding)       │
               └──────────────┬──────────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
┌──────▼──────┐        ┌──────▼──────┐        ┌──────▼──────┐
│ Auth Service│        │Patient Svc  │        │ Doctor/Dept │
│ (JWT & RBAC)│        │  (Profiles) │        │   Service   │
└──────┬──────┘        └──────┬──────┘        └──────┬──────┘
       │                      │                      │
       └──────────────────────┼──────────────────────┘
                              │
               ┌──────────────▼──────────────┐
               │     QUEUE SERVICE (CORE)    │
               │   Central FIFO / Priority   │
               │    Daily Sequence Engine    │
               └──────────────┬──────────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
┌──────▼──────┐        ┌──────▼──────┐        ┌──────▼──────┐
│Kiosk Service│        │Payment Mock │        │Notification │
│ (Hardware & │        │  (₹300 UPI/ │        │(Apple Push, │
│  Sessions)  │        │    Card)    │        │  SMS, Web)  │
└─────────────┘        └─────────────┘        └─────────────┘
```

---

## 2. Microservice Boundaries & Responsibilities

| # | Service | Port | Primary Responsibilities |
|---|---|---|---|
| 1 | **API Gateway** | 8080 | Single entry point, path routing, rate limiting, SSL termination, and token forwarding. |
| 2 | **Auth Service** | 8081 | Role-Based Access Control (`PATIENT`, `RECEPTIONIST`, `DOCTOR`, `ADMIN`, `KIOSK`), JWT issuing, refresh tokens. |
| 3 | **Patient Service** | 8082 | Patient registry, demographic records, UHID generation (`UHID-2026-XXXX`). |
| 4 | **Doctor Service** | 8083 | Doctor availability tracking, consultation room mapping (`Room 102`), specialty listings. |
| 5 | **Department Service**| 8084 | Department codes (`A` for Gen Med, `C` for Cardio, `O` for Ortho, etc.), average service times. |
| 6 | **Queue Service** *(Core)* | 8085 | **The central engine.** Token generation, daily sequence lock, `patientsAhead * avgTime` wait estimations, state transitions (`WAITING` ➔ `NEXT` ➔ `IN_CONSULTATION` ➔ `COMPLETED`). |
| 7 | **Kiosk Service** | 8086 | Hardware kiosk session lifecycles, touch interaction steps (1 to 5), 60s idle timeout auto-reset, multi-language dictionary (EN, HI, MR). |
| 8 | **Payment Service** | 8087 | Demo payment gateway, transaction generation (`MQ-2026-XXXX`), zero sensitive card/PIN storage. |
| 9 | **Notification Service** | 8088 | Progressive notifications (15m before, 5m before, Next, Called), SMS simulation, and WebSocket push. |
| 10 | **Analytics Service** | 8089 | Mode comparison (Reception 42 vs Mobile 67 vs Kiosk 83 = 192 total), processing time benchmarks (3m vs 1.5m vs 45s). |

---

## 3. Database Schema (MySQL + JPA)

### `queue_tokens` Table (Core Central State)
```sql
CREATE TABLE queue_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token_number VARCHAR(20) NOT NULL,            -- e.g. 'A-042'
    patient_id BIGINT NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_age INT,
    patient_gender VARCHAR(20),
    patient_phone VARCHAR(30),
    doctor_id BIGINT NOT NULL,
    doctor_name VARCHAR(255),
    department_id BIGINT NOT NULL,
    department_name VARCHAR(255),
    room_number VARCHAR(50),
    queue_day DATE NOT NULL,                      -- e.g. 2026-10-06
    position INT NOT NULL,
    status ENUM('WAITING', 'NEXT', 'IN_CONSULTATION', 'COMPLETED', 'SKIPPED', 'CANCELLED') NOT NULL,
    priority ENUM('NORMAL', 'HIGH', 'URGENT') DEFAULT 'NORMAL',
    source ENUM('RECEPTION', 'MOBILE', 'KIOSK') NOT NULL,
    token_type ENUM('PHYSICAL', 'DIGITAL') DEFAULT 'PHYSICAL',
    estimated_wait_minutes INT,
    consultation_fee DOUBLE DEFAULT 300.0,
    transaction_id VARCHAR(64),
    payment_method VARCHAR(30),
    payment_status VARCHAR(30),
    created_at DATETIME NOT NULL,
    called_at DATETIME,
    completed_at DATETIME,
    INDEX idx_day_status (queue_day, status),
    INDEX idx_token_number (token_number)
);
```

### `daily_queues` Table (Day Isolation & Kiosk Reset)
```sql
CREATE TABLE daily_queues (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    queue_day DATE NOT NULL UNIQUE,               -- 2026-10-06
    total_tokens_issued INT DEFAULT 0,
    active_tokens_count INT DEFAULT 0,
    completed_tokens_count INT DEFAULT 0,
    is_kiosk_reset_performed BOOLEAN DEFAULT FALSE,
    initialized_at DATETIME NOT NULL,
    reset_at DATETIME
);
```

### `kiosk_sessions` Table (Touchscreen State)
```sql
CREATE TABLE kiosk_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL UNIQUE,
    kiosk_hardware_id VARCHAR(64) NOT NULL,
    step INT NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    selected_department_id BIGINT,
    selected_doctor_id BIGINT,
    patient_name VARCHAR(255),
    patient_age INT,
    patient_gender VARCHAR(20),
    patient_phone VARCHAR(30),
    fee_amount DOUBLE,
    payment_method VARCHAR(30),
    payment_status VARCHAR(30),
    transaction_id VARCHAR(64),
    generated_token_number VARCHAR(20),
    started_at DATETIME NOT NULL,
    last_interaction_at DATETIME,
    completed_at DATETIME,
    is_abandoned BOOLEAN DEFAULT FALSE
);
```

---

## 4. Daily Queue Isolation & Daily Reset Architecture

### Why We Never Delete Old Records
- **Audit & Analytics Preservation**: Real hospitals require reporting on historical throughput, wait time trends, and audit trails.
- **Partitioning by `queue_day`**: The central queue engine filters queries using `WHERE queue_day = CURRENT_DATE AND status IN ('WAITING', 'NEXT', 'IN_CONSULTATION')`.
- **Kiosk Reset**: Calling `POST /api/kiosk/reset` clears all temporary touchscreen forms, in-flight payment states, and resets the daily hardware session without erasing historical data.

---

## 5. Wait Time Algorithm

$$\text{Estimated Wait (min)} = \text{Patients Ahead} \times \text{Average Service Time (min)}$$

Where:
- $\text{Patients Ahead} = \text{Active Position} - 1$
- $\text{Average Service Time} = 5\text{ minutes}$ (configurable per department/specialist)
- **Clinical Display Policy**: Always displayed with prefix `"~"` and labeled *"Estimated Waiting Time"* to set appropriate patient expectations.

---

## 6. Real-Time Event Choreography

When any event occurs (`CALL NEXT`, `KIOSK TOKEN GENERATED`, `PATIENT REGISTRATION`):
1. **Queue Service** executes state mutation inside a Spring `@Transactional` boundary.
2. An internal Spring Application Event or RabbitMQ / Kafka event is published (`QueueEvent`).
3. **Notification Service** & **WebSocket Controller** broadcasts to all subscribed clients:
   - `/topic/queue/updates`: Updates Waiting Room TV (`/queue-display`) & Staff Table.
   - `/topic/patient/{tokenNumber}`: Triggers Apple-style progress animation on the patient's smartphone.
