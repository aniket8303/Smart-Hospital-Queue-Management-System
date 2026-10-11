# MediQueue — SMS Gateway Integration & DLT Compliance Guide

> **Target Hospital:** Diksha Hospital  
> **Deployment Region:** India (TRAI DLT Regulated)  
> **Primary Provider:** Fast2SMS / MSG91 (DLT Route)  
> **Fallback / International:** Twilio  
> **Architecture Pattern:** Transactional Outbox Pattern + Asynchronous Poller (`@Scheduled`)

---

## 1. Indian Regulatory Framework (TRAI DLT Compliance)

Under the Telecom Regulatory Authority of India (TRAI) regulations (TCCCPR 2018), sending SMS messages to Indian mobile numbers (+91) requires registration on a Distributed Ledger Technology (DLT) platform (such as Jio, Airtel, Vodafone Idea, or BSNL DLT portal).

### Required DLT Prerequisites for Diksha Hospital:
1. **Principal Entity (PE) Registration:** Register "Diksha Hospital Pvt Ltd" as an enterprise entity.
2. **Sender Header (Sender ID):** 6-character alphabetic header assigned to the hospital (e.g., `DIKSHA`, `DIKSHH`).
3. **Template Registration:** Pre-approved transactional/service-implicit templates. SMS gateways reject messages whose wording deviates from the registered template text.

---

## 2. Approved DLT Message Templates

MediQueue uses the following standardized templates:

### Template 1: Registration Confirmation (Event: `REGISTRATION_CONFIRMED`)
- **Template ID:** `1107168392019283711`
- **Text:**
  ```
  Dear {#var#}, your token for {#var#} at Diksha Hospital is {#var#}. Doctor: {#var#}. Approx wait: {#var#} mins. Track: {#var#} - Diksha Hospital
  ```
- **Sample Rendered Message:**
  > *Dear Aniket Parekar, your token for General Medicine at Diksha Hospital is GM-042. Doctor: Dr. Priya Sharma. Approx wait: 15 mins. Track: https://mediqueue.dikshahospital.com/p/t-042 - Diksha Hospital*

### Template 2: 15-Minute Turn Approach (Event: `TURN_15MIN`)
- **Template ID:** `1107168392019283712`
- **Text:**
  ```
  Diksha Hospital Alert: Token {#var#} has 3 patients ahead. Approx 15 mins until your consultation. Please report to {#var#}. - Diksha Hospital
  ```

### Template 3: Next in Line Alert (Event: `NEXT_IN_LINE`)
- **Template ID:** `1107168392019283713`
- **Text:**
  ```
  Diksha Hospital Alert: Token {#var#}, you are NEXT. Please wait outside {#var#} Room {#var#}. - Diksha Hospital
  ```

### Template 4: Token Called Alert (Event: `TOKEN_CALLED`)
- **Template ID:** `1107168392019283714`
- **Text:**
  ```
  Token {#var#} is now CALLED by {#var#} at Room {#var#}. Please proceed into the consultation cabin immediately. - Diksha Hospital
  ```

---

## 3. Architecture: Durable Notification Outbox

To prevent network jitter or telco latency from delaying clinical queue operations or losing patient messages:

```
[ Queue Engine Operation ]
  (e.g., Token Created, Doctor Calls Next)
            │
            ▼
┌────────────────────────────────────────────────────────┐
│ Persistence: Same DB Transaction (@Transactional)      │
│  1. Insert / Update queue_tokens                       │
│  2. Insert milestone records into notification_outbox  │
│     (status: PENDING, scheduled_for: now / future)     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Polling Dispatcher: @Scheduled(fixedDelay = 5000)      │
│  1. SELECT * FROM notification_outbox WHERE            │
│     status = 'PENDING' AND scheduled_time <= NOW()     │
│  2. Acquire row lock                                   │
│  3. Call Fast2SmsGateway.sendSms(...)                  │
│  4. If HTTP 200: Set status = 'SENT', delivered_at=NOW │
│  5. If Error: Increment retry_count, backoff           │
│     (Max 3 retries, then status = 'FAILED')            │
└────────────────────────────────────────────────────────┘
```

---

## 4. Configuration & Environment Variables

### 4.1 Production Fast2SMS Setup

```bash
# In backend/src/main/resources/application.yml or system environment:
FAST2SMS_API_KEY=YourFast2SmsAuthorizationKey
SMS_PROVIDER=FAST2SMS
SMS_SENDER_ID=DIKSHA
SMS_ROUTE=dlt
MEDIQUEUE_DEMO_MODE=false
```

### 4.2 Test & Carrier Simulation Mode

When `MEDIQUEUE_DEMO_MODE=true` or when no `FAST2SMS_API_KEY` is specified, MediQueue automatically routes messages through the internal test carrier simulation engine:
- Messages are logged in structured JSON with recipient phone, message body, template ID, and timestamp.
- Outbox state transitions from `PENDING` to `SENT` with simulated network delivery latency.
- In-app notification center on the patient dashboard receives the identical copy so users can visually verify notifications without incurring SMS costs.

---

## 5. Mobile Delivery Verification Instructions

To verify SMS delivery to an actual mobile phone:

1. Obtain a Fast2SMS API key with registered sender credentials (or free development credits on Fast2SMS Quick Route).
2. Export the environment variable:
   ```powershell
   $env:FAST2SMS_API_KEY="your_api_key_here"
   $env:MEDIQUEUE_DEMO_MODE="false"
   ```
3. Register as a patient with your actual mobile number (e.g. `+919876543210`).
4. Generate a queue token via Reception, Web, or Kiosk.
5. Inspect the Spring Boot application log to observe:
   ```
   [NotificationDispatcher] Polling outbox: Found 1 pending notifications
   [Fast2SmsGateway] Dispatching SMS via Fast2SMS DLT route to: 9876543210
   [Fast2SmsGateway] HTTP 200 Response: {"return": true, "request_id": "req_881923"}
   [NotificationDispatcher] Outbox ID 42 marked as SENT
   ```
6. Receive the SMS on the mobile device.

---

## 6. Cancellation & Deduplication Invariants

1. **Purge on Cancellation:** If a patient cancels their token, all pending future outbox messages (`TURN_15MIN`, `TURN_5MIN`, `NEXT_IN_LINE`) are immediately marked `CANCELLED` so obsolete alerts are never dispatched.
2. **Deduplication:** A unique combination of `token_id` + `event_type` ensures the system cannot send duplicate `REGISTRATION_CONFIRMED` or duplicate `TOKEN_CALLED` messages for the same patient encounter.
