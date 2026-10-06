package com.mediqueue.core.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @PostMapping("/demo")
    public ResponseEntity<Map<String, Object>> processDemoPayment(@RequestBody Map<String, Object> paymentRequest) {
        String txnId = "MQ-" + LocalDateTime.now().getYear() + "-" + (1000 + (int)(Math.random() * 9000));
        
        Map<String, Object> result = new HashMap<>();
        result.put("transactionId", txnId);
        result.put("status", "SUCCESS");
        result.put("amount", paymentRequest.getOrDefault("amount", 300));
        result.put("method", paymentRequest.getOrDefault("method", "UPI"));
        result.put("timestamp", LocalDateTime.now().toString());
        result.put("notice", "Demo / Simulated Payment. No real bank or card data processed.");
        
        return ResponseEntity.ok(result);
    }
}
