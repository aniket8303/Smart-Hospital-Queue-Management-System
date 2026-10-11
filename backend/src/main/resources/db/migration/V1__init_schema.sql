-- ==============================================================================
-- MEDIQUEUE 2.0 — SMART HOSPITAL QUEUE MANAGEMENT SYSTEM
-- AUTHORITATIVE PRODUCTION DATABASE MIGRATION SCRIPT (MySQL 8 / Hibernate)
-- Target Hospital: Diksha Hospital (OPD Wing A)
-- Team: CodeForge
-- ==============================================================================

-- 1. Hospital Profile & Configuration
CREATE TABLE IF NOT EXISTS hospital_configs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hospital_name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    contact_phone VARCHAR(30),
    emergency_phone VARCHAR(30),
    opd_start_time VARCHAR(10) DEFAULT '08:00',
    opd_end_time VARCHAR(10) DEFAULT '20:00',
    average_consultation_minutes INT DEFAULT 5,
    sms_enabled BOOLEAN DEFAULT TRUE,
    demo_mode BOOLEAN DEFAULT TRUE,
    active_payment_provider VARCHAR(30) DEFAULT 'RAZORPAY',
    active_sms_provider VARCHAR(30) DEFAULT 'FAST2SMS'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Departments
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    floor VARCHAR(50),
    wing VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Doctors
CREATE TABLE IF NOT EXISTS doctors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    department_id BIGINT NOT NULL,
    department_name VARCHAR(100),
    room_number VARCHAR(50),
    is_available BOOLEAN DEFAULT TRUE,
    average_consultation_time_min INT DEFAULT 5,
    consultation_fee DECIMAL(10,2) DEFAULT 300.00,
    avatar_url VARCHAR(200),
    CONSTRAINT fk_doctor_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_doctor_department ON doctors(department_id);
CREATE INDEX idx_doctor_available ON doctors(is_available);

-- 4. Patients
CREATE TABLE IF NOT EXISTS patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    uhid VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100),
    age INT,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    role VARCHAR(30) DEFAULT 'ROLE_PATIENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_patient_uhid ON patients(uhid);
CREATE INDEX idx_patient_phone ON patients(phone);

-- 5. Daily Queue Tracker (Daily Isolation)
CREATE TABLE IF NOT EXISTS daily_queues (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    queue_day DATE NOT NULL UNIQUE,
    total_tokens_issued INT DEFAULT 0,
    active_tokens_count INT DEFAULT 0,
    completed_tokens_count INT DEFAULT 0,
    is_kiosk_reset_performed BOOLEAN DEFAULT FALSE,
    initialized_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_daily_queue_day ON daily_queues(queue_day);

-- 6. Queue Tokens (Authoritative Central Engine)
CREATE TABLE IF NOT EXISTS queue_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token_number VARCHAR(20) NOT NULL,
    patient_id BIGINT NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    patient_age INT,
    patient_gender VARCHAR(20),
    patient_phone VARCHAR(20),
    doctor_id BIGINT NOT NULL,
    doctor_name VARCHAR(100),
    department_id BIGINT NOT NULL,
    department_name VARCHAR(100),
    room_number VARCHAR(50),
    queue_day DATE NOT NULL,
    position INT NOT NULL,
    status VARCHAR(25) NOT NULL,
    priority VARCHAR(15) NOT NULL,
    source VARCHAR(20) NOT NULL,
    token_type VARCHAR(20),
    estimated_wait_minutes INT DEFAULT 0,
    consultation_fee DECIMAL(10,2) DEFAULT 300.00,
    transaction_id VARCHAR(64),
    payment_method VARCHAR(30),
    payment_status VARCHAR(30) DEFAULT 'SUCCESS',
    created_at TIMESTAMP NOT NULL,
    called_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    CONSTRAINT uk_day_token UNIQUE (queue_day, token_number),
    CONSTRAINT fk_token_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_queue_day_status ON queue_tokens(queue_day, status);
CREATE INDEX idx_token_number ON queue_tokens(token_number);
CREATE INDEX idx_token_patient_id ON queue_tokens(patient_id);

-- 7. Outpatient Appointments
CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    doctor_id BIGINT NOT NULL,
    doctor_name VARCHAR(100) NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    appointment_time VARCHAR(50) NOT NULL,
    appointment_date VARCHAR(50) NOT NULL,
    room_number VARCHAR(50),
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_appointment_patient ON appointments(patient_id);

-- 8. Payment Orders & Transactions
CREATE TABLE IF NOT EXISTS payment_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL UNIQUE,
    patient_id BIGINT NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(20) NOT NULL,
    department_id BIGINT,
    doctor_id BIGINT,
    source VARCHAR(20),
    payment_method VARCHAR(30),
    provider VARCHAR(30) DEFAULT 'RAZORPAY',
    provider_order_id VARCHAR(64),
    provider_payment_id VARCHAR(64),
    provider_signature VARCHAR(128),
    idempotency_key VARCHAR(100),
    issued_token_number VARCHAR(30),
    created_at TIMESTAMP NOT NULL,
    paid_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_order_id ON payment_orders(order_id);
CREATE INDEX idx_patient_orders ON payment_orders(patient_id);

CREATE TABLE IF NOT EXISTS payment_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL,
    transaction_id VARCHAR(64) NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    webhook_payload TEXT,
    signature_verified BOOLEAN DEFAULT FALSE,
    is_refunded BOOLEAN DEFAULT FALSE,
    refund_reason VARCHAR(255),
    created_at TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_txn_id ON payment_transactions(transaction_id);
CREATE INDEX idx_order_id_txn ON payment_transactions(order_id);

CREATE TABLE IF NOT EXISTS patient_payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(50) NOT NULL UNIQUE,
    patient_id BIGINT NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    token_number VARCHAR(30),
    doctor_id BIGINT,
    doctor_name VARCHAR(100),
    department_id BIGINT,
    department_name VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    is_demo BOOLEAN DEFAULT FALSE,
    receipt_url VARCHAR(255),
    paid_at TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_payment_patient ON patient_payments(patient_id);

-- 9. Durable Notification Outbox
CREATE TABLE IF NOT EXISTS notification_outbox (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token_number VARCHAR(30) NOT NULL,
    patient_id BIGINT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    channel VARCHAR(20) NOT NULL DEFAULT 'SMS',
    alert_type VARCHAR(35) NOT NULL,
    message_body VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    retry_count INT DEFAULT 0,
    provider VARCHAR(30) DEFAULT 'FAST2SMS',
    provider_message_id VARCHAR(100),
    scheduled_at TIMESTAMP NOT NULL,
    sent_at TIMESTAMP NULL,
    failure_reason VARCHAR(500),
    created_at TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_status_scheduled ON notification_outbox(status, scheduled_at);
CREATE INDEX idx_token_notifs ON notification_outbox(token_number);

CREATE TABLE IF NOT EXISTS patient_notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message VARCHAR(500) NOT NULL,
    type VARCHAR(30) NOT NULL,
    token_number VARCHAR(30),
    is_read BOOLEAN DEFAULT FALSE,
    sms_recipient VARCHAR(30),
    created_at TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_notif_patient ON patient_notifications(patient_id);

-- 10. Audit Events & Kiosk Sessions
CREATE TABLE IF NOT EXISTS audit_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    actor_role VARCHAR(30),
    actor_username VARCHAR(60),
    patient_id BIGINT,
    token_number VARCHAR(30),
    details TEXT,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_event_type ON audit_events(event_type);
CREATE INDEX idx_audit_timestamp ON audit_events(timestamp);

CREATE TABLE IF NOT EXISTS kiosk_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL UNIQUE,
    kiosk_id VARCHAR(50) NOT NULL,
    step INT DEFAULT 1,
    language VARCHAR(10) DEFAULT 'en',
    current_token_id BIGINT,
    created_at TIMESTAMP NOT NULL,
    last_activity_at TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_kiosk_session_id ON kiosk_sessions(session_id);
