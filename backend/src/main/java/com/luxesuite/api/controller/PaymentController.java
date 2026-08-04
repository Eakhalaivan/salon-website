package com.luxesuite.api.controller;

import com.luxesuite.api.model.Payment;
import com.luxesuite.api.service.BillingService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import io.micrometer.core.annotation.Timed;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final BillingService billingService;

    @PostMapping("/invoice/{invoiceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @Timed(value = "payments.api.latency", description = "Latency of payment endpoints")
    public ResponseEntity<Payment> processPayment(
            @PathVariable Long invoiceId,
            @Valid @RequestBody PaymentRequest request
    ) {
        // Stripe/Razorpay abstraction would normally live here. For now, it passes straight to BillingService.
        return ResponseEntity.ok(billingService.processPayment(
                invoiceId, request.getAmount(), request.getPaymentMethod(), request.getTransactionRef()
        ));
    }

    @PostMapping("/stripe/create-payment-intent/{invoiceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST', 'CUSTOMER')")
    @Timed(value = "payments.api.latency", description = "Latency of payment endpoints")
    public ResponseEntity<Map<String, String>> createStripePaymentIntent(@PathVariable Long invoiceId) {
        String clientSecret = billingService.createStripePaymentIntent(invoiceId);
        Map<String, String> response = new HashMap<>();
        response.put("clientSecret", clientSecret);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/stripe/create-deposit-intent/{appointmentId}")
    @Timed(value = "payments.api.latency", description = "Latency of payment endpoints")
    public ResponseEntity<Map<String, String>> createStripeDepositIntent(@PathVariable Long appointmentId) {
        String clientSecret = billingService.createStripeDepositIntent(appointmentId);
        Map<String, String> response = new HashMap<>();
        response.put("clientSecret", clientSecret);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/stripe/create-subscription-intent/{planId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Timed(value = "payments.api.latency", description = "Latency of payment endpoints")
    public ResponseEntity<Map<String, String>> createStripeSubscriptionIntent(@PathVariable Long planId) {
        String clientSecret = billingService.createStripeSubscriptionIntent(planId);
        Map<String, String> response = new HashMap<>();
        response.put("clientSecret", clientSecret);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/stripe/webhook")
    @Timed(value = "payments.api.latency", description = "Latency of payment endpoints")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader
    ) {
        billingService.handleStripeWebhook(payload, sigHeader);
        return ResponseEntity.ok("Webhook processed");
    }

    @PostMapping("/razorpay/create-order/{invoiceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST', 'CUSTOMER')")
    @Timed(value = "payments.api.latency", description = "Latency of payment endpoints")
    public ResponseEntity<Map<String, String>> createRazorpayOrder(@PathVariable Long invoiceId) {
        String orderId = billingService.createRazorpayOrder(invoiceId);
        Map<String, String> response = new HashMap<>();
        response.put("orderId", orderId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/razorpay/webhook")
    @Timed(value = "payments.api.latency", description = "Latency of payment endpoints")
    public ResponseEntity<String> handleRazorpayWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature
    ) {
        billingService.handleRazorpayWebhook(payload, signature);
        return ResponseEntity.ok("Webhook processed");
    }
}

@Data
class PaymentRequest {
    @NotNull
    @Positive
    private BigDecimal amount;
    
    @NotBlank
    private String paymentMethod;
    
    private String transactionRef;
}


