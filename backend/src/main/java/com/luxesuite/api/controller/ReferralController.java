package com.luxesuite.api.controller;

import com.luxesuite.api.dto.PageResponse;
import com.luxesuite.api.dto.ReferralDto;
import com.luxesuite.api.service.ReferralService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/referrals")
@RequiredArgsConstructor
public class ReferralController {

    private final ReferralService referralService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PageResponse<ReferralDto>> getMyReferrals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(referralService.getMyReferrals(page, size));
    }

    @GetMapping("/me/code")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, String>> getMyReferralCode() {
        return ResponseEntity.ok(Map.of("code", referralService.getMyReferralCode()));
    }
}
