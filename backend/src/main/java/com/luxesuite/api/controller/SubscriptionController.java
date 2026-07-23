package com.luxesuite.api.controller;

import com.luxesuite.api.dto.CustomerSubscriptionDto;
import com.luxesuite.api.dto.SubscriptionPlanDto;
import com.luxesuite.api.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import com.luxesuite.api.dto.PageResponse;

@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping("/plans")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST', 'CUSTOMER')")
    public ResponseEntity<PageResponse<SubscriptionPlanDto>> getActivePlans(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String businessType
    ) {
        return ResponseEntity.ok(subscriptionService.getActivePlans(page, size, businessType));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PageResponse<CustomerSubscriptionDto>> getMySubscriptions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(subscriptionService.getMySubscriptions(page, size));
    }

}
