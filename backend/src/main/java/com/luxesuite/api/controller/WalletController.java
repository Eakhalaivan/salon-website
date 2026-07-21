package com.luxesuite.api.controller;

import com.luxesuite.api.dto.WalletDto;
import com.luxesuite.api.dto.WalletTopupRequest;
import com.luxesuite.api.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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

}
