package com.luxesuite.api.controller;

import com.luxesuite.api.dto.AiRecommendationDto;
import com.luxesuite.api.service.ai.AiRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recommendations")
@RequiredArgsConstructor
public class AiRecommendationController {

    private final AiRecommendationService recommendationService;

    @GetMapping("/services/{customerId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'MANAGER', 'ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<List<AiRecommendationDto>> getRecommendations(@PathVariable Long customerId) {
        return ResponseEntity.ok(recommendationService.getRecommendationsForCustomer(customerId));
    }
}
