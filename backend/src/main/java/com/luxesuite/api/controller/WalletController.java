package com.luxesuite.api.controller;

import com.luxesuite.api.dto.WalletDto;
import com.luxesuite.api.dto.WalletTopupRequest;
import com.luxesuite.api.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<WalletDto> getMyWallet() {
        return ResponseEntity.ok(walletService.getMyWallet());
    }

    @PostMapping("/topup")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, String>> createTopupIntent(@RequestBody WalletTopupRequest request) {
        String clientSecret = walletService.createTopupPaymentIntent(request.getAmount());
        return ResponseEntity.ok(Map.of("clientSecret", clientSecret));
    }

    @PostMapping("/topup/mock")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, String>> mockTopup(@RequestBody WalletTopupRequest request) {
        walletService.mockTopup(request.getAmount());
        return ResponseEntity.ok(Map.of("status", "success"));
    }

    @PostMapping("/razorpay/create-order")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, String>> createRazorpayOrder(@RequestBody WalletTopupRequest request) {
        String orderId = walletService.createRazorpayTopupOrder(request.getAmount());
        return ResponseEntity.ok(Map.of("orderId", orderId));
    }

    @PostMapping("/razorpay/verify")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, String>> verifyRazorpayTopup(@RequestBody Map<String, String> payload) {
        String paymentId = payload.get("razorpay_payment_id");
        String orderId = payload.get("razorpay_order_id");
        String signature = payload.get("razorpay_signature");
        BigDecimal amount = new BigDecimal(payload.get("amount"));
        
        walletService.verifyRazorpayTopup(paymentId, orderId, signature, amount);
        return ResponseEntity.ok(Map.of("status", "success"));
    }

}
