# MediQueue — Production Database Operations & Migration Guide

> **Database:** MySQL 8.0+ / Amazon RDS MySQL / Google Cloud SQL  
> **Schema Migration Engine:** Flyway  
> **Initial Migration Script:** `backend/src/main/resources/db/migration/V1__init_schema.sql`  
> **Target Production Database Name:** `mediqueue_db`

---

## 1. Schema Architecture Overview

MediQueue uses a relational normalized schema across 10 core tables:

```
┌─────────────────┐       ┌────────────────────┐       ┌─────────────────┐
│ hospital_config │       │    departments     │──────▶│     doctors     │
└─────────────────┘       └─────────┬──────────┘       └────────┬────────┘
                                    │                           │
                                    ▼                           ▼
┌─────────────────┐       ┌────────────────────┐       ┌─────────────────┐
│    patients     │──────▶│    queue_tokens    │◀──────│   queue_days    │
└────────┬────────┘       └─────────┬──────────┘       └─────────────────┘
         │                          │
         ▼                          ▼
┌─────────────────┐       ┌────────────────────┐       ┌─────────────────┐
│ payment_orders  │       │notification_outbox │       │  audit_events   │
└────────┬────────┘       └────────────────────┘       └─────────────────┘
         │
         ▼
┌─────────────────┐
│payment_transact.│
└─────────────────┘
```

### Table Dictionary:

1. `hospital_config`: Global hospital metadata, contact information, operating hours, and queue parameters.
2. `departments`: Hospital clinical units (e.g., General Medicine, Cardiology, Orthopedics).
3. `doctors`: Medical practitioners, room assignments, specialty, consultation fee, and active status.
4. `patients`: Demographic patient records, unique hospital identification (UHID), phone numbers.
5. `queue_days`: Authoritative daily queue ledger tracking date and last issued sequence per department.
6. `queue_tokens`: The central token entity. Enforces `uk_day_token UNIQUE (queue_day, token_number)`.
7. `payment_orders`: Pre-transaction payment intents with server-calculated consultation fees and idempotency keys.
8. `payment_transactions`: Completed transaction audit records with gateway payment IDs and HMAC signatures.
9. `notification_outbox`: Transactional outbox for asynchronous, durable SMS and push notifications.
10. `audit_events`: Append-only immutable log recording administrative, clinical, and security actions.

---

## 2. Setting Up MySQL for Production

### 2.1 Database Creation & User Provisioning

Execute the following SQL as MySQL `root` administrator:

```sql
-- 1. Create database with UTF-8 character encoding
CREATE DATABASE IF NOT EXISTS mediqueue_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Create dedicated application service user
CREATE USER IF NOT EXISTS 'mediqueue_app'@'%' IDENTIFIED BY 'StrongRandomPassword_2026!';

-- 3. Grant required application privileges
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES ON mediqueue_db.* TO 'mediqueue_app'@'%';

-- 4. Flush privileges
FLUSH PRIVILEGES;
```

### 2.2 Production Spring Boot Configuration

In `backend/src/main/resources/application.yml` or via production environment variables:

```yaml
spring:
  datasource:
    url: ${MYSQL_URL:jdbc:mysql://localhost:3306/mediqueue_db?useSSL=true&requireSSL=true&serverTimezone=Asia/Kolkata&characterEncoding=UTF-8}
    username: ${MYSQL_USER:mediqueue_app}
    password: ${MYSQL_PASSWORD:StrongRandomPassword_2026!}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      idle-timeout: 300000
      connection-timeout: 20000
      max-lifetime: 1200000
      leak-detection-threshold: 60000

  jpa:
    database-platform: org.hibernate.dialect.MySQL8Dialect
    hibernate:
      ddl-auto: validate   # Prevents accidental schema mutations in production
    show-sql: false

  flyway:
    enabled: true
    baseline-on-migrate: true
    locations: classpath:db/migration
```

---

## 3. Database Migration Execution

Flyway automatically applies all pending migrations on Spring Boot application startup.

### 3.1 Manual Migration Execution (Alternative)

If using external CI/CD pipeline or standalone Flyway CLI:

```bash
# Using Flyway CLI
flyway -url="jdbc:mysql://localhost:3306/mediqueue_db" \
       -user="mediqueue_app" \
       -password="StrongRandomPassword_2026!" \
       -locations="filesystem:backend/src/main/resources/db/migration" \
       migrate
```

### 3.2 Verification Query

Verify applied migrations in MySQL:

```sql
SELECT installed_rank, version, description, type, script, execution_time, success
FROM flyway_schema_history
ORDER BY installed_rank;
```

---

## 4. Automated Backup & Recovery Procedures

### 4.1 Daily Automated Backup Script (`backup_mediqueue.sh`)

```bash
#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/var/backups/mediqueue"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/mediqueue_db_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting MediQueue production backup..."

# Perform consistent single-transaction mysqldump
mysqldump \
  --single-transaction \
  --quick \
  --triggers \
  --routines \
  --hex-blob \
  --host=localhost \
  --user=mediqueue_app \
  --password="StrongRandomPassword_2026!" \
  mediqueue_db | gzip > "${BACKUP_FILE}"

echo "[$(date)] Backup completed: ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"

# Prune backups older than 30 days
find "${BACKUP_DIR}" -type f -name "mediqueue_db_*.sql.gz" -mtime +30 -delete
```

### 4.2 Disaster Recovery / Restoration Procedure

To restore from a backup archive:

```bash
# 1. Uncompress and restore database
gunzip < /var/backups/mediqueue/mediqueue_db_20261011_120000.sql.gz | \
  mysql --host=localhost --user=root --password="RootPassword" mediqueue_db

# 2. Verify restored queue tokens and patient records
mysql -u mediqueue_app -p mediqueue_db -e "SELECT COUNT(*) AS total_tokens FROM queue_tokens;"
```

---

## 5. Daily Queue Management & Historical Data Invariant

### 5.1 Preserving Historical Records
**Critical Rule:** MediQueue **never deletes** past tokens, consultations, or patient records during the daily queue reset.

- Daily queues are segregated by the `queue_day` column (formatted `YYYY-MM-DD`).
- Active queries filter on `queue_day = CURRENT_DATE()`.
- Historical consultations remain queryable for hospital reporting, patient visit history, and audit analytics indefinitely.

---

## 6. Health & Diagnostic Queries

To inspect system state in MySQL:

```sql
-- Active Queue Snapshot for Today
SELECT qt.token_number, d.name AS doctor_name, dep.name AS department,
       qt.status, qt.registration_source, qt.created_at
FROM queue_tokens qt
JOIN doctors d ON qt.doctor_id = d.id
JOIN departments dep ON qt.department_id = dep.id
WHERE qt.queue_day = CURRENT_DATE()
ORDER BY qt.id ASC;

-- Unsent Notifications in Outbox
SELECT id, recipient_phone, event_type, status, retry_count, created_at
FROM notification_outbox
WHERE status = 'PENDING';

-- Reconciliation: Completed Payments vs Created Tokens
SELECT po.order_id, po.amount, po.status, pt.transaction_id, pt.payment_mode
FROM payment_orders po
LEFT JOIN payment_transactions pt ON po.id = pt.order_id
WHERE po.created_at >= CURDATE();
```
