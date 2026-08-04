package com.luxesuite.api.controller;

import com.luxesuite.api.dto.WaitlistDto;
import com.luxesuite.api.service.WaitlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/waitlists")
@RequiredArgsConstructor
public class WaitlistController {
    
    private final WaitlistService waitlistService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST', 'CUSTOMER')")
    public ResponseEntity<WaitlistDto> joinWaitlist(@Valid @RequestBody WaitlistDto request) {
        WaitlistDto created = waitlistService.joinWaitlist(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
