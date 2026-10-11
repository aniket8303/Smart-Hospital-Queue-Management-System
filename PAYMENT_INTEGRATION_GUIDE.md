# MediQueue — Payment Gateway Integration & Verification Guide

> **Target Hospital:** Diksha Hospital  
> **Provider Support:** Razorpay (Primary - India), Cashfree / Stripe (Supported via Abstraction)  
> **Architecture Pattern:** Server-Initiated Orders + Cryptographic HMAC-SHA256 Verification + Idempotent Webhooks

---

## 1. Overview & Security Mandates

MediQueue enforces a **Zero-Trust Client** policy for financial transactions:
1. **Never Trust the Client:** A frontend modal reporting "Payment Successful" is never treated as proof of payment. Only cryptographically verified server-to-server callbacks or HMAC-SHA256 signature checks confirm consultation bookings.
2. **Authoritative Consultation Fees:** Fees are resolved server-side from the `Doctor` record (e.g. ₹300 for Dr. Priya Sharma, General Medicine). Patients and kiosks cannot modify the transaction amount in request payloads.
3. **PCI-DSS Compliance:** MediQueue **never** touches, handles, or stores sensitive credit card numbers, CVVs, expiry dates, or UPI PINs. All sensitive instrument handling is performed directly in the PCI-DSS Level 1 certified gateway iframe.

---

## 2. Payment Lifecycle Workflow

```
 [ Patient / Kiosk ]           [ Spring Boot Core ]              [ Razorpay Server ]
          │                             │                                 │
  1. Select Doctor & Time               │                                 │
          │                             │                                 │
  2. POST /api/payments/create-order    │                                 │
     { doctorId: 1, patientId: 101 }    │                                 │
          │────────────────────────────▶│                                 │
          │                             │ 3. Look up fee: ₹300.00         │
          │                             │ 4. Generate orderId:            │
          │                             │    order_diksha_xxx             │
          │                             │ 5. POST /v1/orders              │
          │                             │────────────────────────────────▶│
          │                             │                                 │
          │                             │ 6. Order created (status: CREATED)
          │                             │◀────────────────────────────────│
          │ 7. Return { orderId,        │                                 │
          │    amount: 30000, keyId }   │                                 │
          │◀────────────────────────────│                                 │
          │                                                               │
  8. Open Razorpay Checkout Modal                                         │
     (UPI, Google Pay, NetBanking, Card)                                  │
          │──────────────────────────────────────────────────────────────▶│
          │                                                               │
          │ 9. Customer authorizes payment                                │
          │◀──────────────────────────────────────────────────────────────│
          │    Receives { razorpay_order_id,                              │
          │               razorpay_payment_id,                            │
          │               razorpay_signature }                            │
          │                                                               │
 10. POST /api/payments/verify                                            │
     { orderId, paymentId, signature }                                    │
          │────────────────────────────▶│                                 │
          │                             │ 11. Compute HMAC-SHA256:        │
          │                             │     hash(orderId + "|" +        │
          │                             │          paymentId, secret)     │
          │                             │ 12. Compare with signature      │
          │                             │     • MATCH: Update status PAID │
          │                             │              Issue Queue Token  │
          │                             │     • MISMATCH: Reject 400      │
          │                             │                 Log audit event │
 13. Receive Confirmed Token & Receipt  │                                 │
     { tokenNumber: "GM-042", ... }     │                                 │
          │◀────────────────────────────│                                 │
```

---

## 3. Configuration & Environment Variables

To configure Razorpay integration for local testing or production:

### 3.1 Backend Variables (`backend/src/main/resources/application.yml` or OS Environment)

```bash
# Razorpay Credentials (from https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID=rzp_test_YourKeyIdHere
RAZORPAY_KEY_SECRET=YourKeySecretHere
RAZORPAY_WEBHOOK_SECRET=YourWebhookSecretHere

# Mode: Set to false in production to enforce live gateway calls
MEDIQUEUE_DEMO_MODE=false
```

### 3.2 Frontend Variables (`.env.local`)

```bash
# Public Key ID exposed to frontend checkout iframe
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YourKeyIdHere
NEXT_PUBLIC_DEMO_PAYMENT=false
```

---

## 4. Cryptographic Signature Verification Logic

In `com.mediqueue.core.service.payment.RazorpayPaymentGateway`:

```java
public boolean verifySignature(String orderId, String paymentId, String clientSignature) {
    String payload = orderId + "|" + paymentId;
    try {
        Mac sha256Hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256Hmac.init(secretKey);
        byte[] hash = sha256Hmac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        String generatedSignature = HexFormat.of().formatHex(hash);
        return MessageDigest.isEqual(generatedSignature.getBytes(), clientSignature.getBytes());
    } catch (Exception e) {
        log.error("Signature verification failed", e);
        return false;
    }
}
```

*Note: `MessageDigest.isEqual` is used to prevent timing attacks during string comparison.*

---

## 5. Webhook Integration & Idempotency

Webhooks provide asynchronous redundancy in case a patient closes their browser tab immediately after UPI authorization before the frontend can call `/verify`.

### 5.1 Webhook Endpoint
- **URL:** `POST https://api.dikshahospital.com/api/payments/webhook`
- **Header:** `X-Razorpay-Signature: <hmac_hex>`
- **Event Subscribed:** `payment.captured`

### 5.2 Idempotency Invariants
1. The endpoint validates `X-Razorpay-Signature` against `RAZORPAY_WEBHOOK_SECRET`.
2. The payload is queried against `PaymentTransactionRepository` by `transactionId`.
3. If an existing transaction is already recorded as `SUCCESS`, the endpoint returns HTTP `200 OK` immediately without re-crediting or issuing duplicate queue tokens.
4. If pending, the transaction transitions to `SUCCESS`, the corresponding `PaymentOrder` is marked `PAID`, and the queue token is allocated.

---

## 6. End-to-End Test Mode Verification

MediQueue includes test verification utilities:

### 6.1 Test Credentials
- **Test UPI VPA:** `success@razorpay` (Simulates instant approval)
- **Failure UPI VPA:** `failure@razorpay` (Simulates bank decline)
- **Test Card:** `4111 1111 1111 1111`, CVV: `123`, Expiry: `12/28`, OTP: `123456`

### 6.2 Automated Test Coverage
Verified by `PlatformProductionWorkflowTest`:
- `testPaymentVerification_HMACSignatureSuccess()`: Proves that valid HMAC-SHA256 signatures are authenticated and transition orders to `PAID`.
- `testPaymentVerification_TamperedSignatureRejected()`: Proves that tampered or forged signatures are immediately rejected with `400 Bad Request`.
- `testPaymentWebhook_IdempotentHandling()`: Proves that replaying the identical payment webhook does not create duplicate transactions or dual queue allocations.

---

## 7. Production Go-Live Checklist for Diksha Hospital

1. Complete Razorpay Merchant Onboarding & KYC for Diksha Hospital.
2. Generate Production API Keys (`rzp_live_...`) in the merchant dashboard.
3. Configure Webhook URL `https://api.dikshahospital.com/api/payments/webhook` with the secret.
4. Set HTTPS / TLS 1.3 termination on production domain.
5. Set `MEDIQUEUE_DEMO_MODE=false` and `NEXT_PUBLIC_DEMO_PAYMENT=false`.
6. Run 1 live INR 1.00 test transaction from mobile UPI and verify bank account settlement.
