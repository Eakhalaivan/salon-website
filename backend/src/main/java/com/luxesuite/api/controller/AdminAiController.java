package com.luxesuite.api.controller;

import com.luxesuite.api.dto.AiInventoryAlertDto;
import com.luxesuite.api.dto.AiMarketingSuggestionDto;
import com.luxesuite.api.dto.AiSalesForecastDto;
import com.luxesuite.api.security.SecurityUtils;
import com.luxesuite.api.service.ai.AiMarketingService;
import com.luxesuite.api.service.ai.InventoryPredictionService;
import com.luxesuite.api.service.ai.SalesForecastService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/ai")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class AdminAiController {

    private final AiMarketingService marketingService;
    private final SalesForecastService forecastService;
    private final InventoryPredictionService inventoryPredictionService;
    private final SecurityUtils securityUtils;

    @PostMapping("/marketing-suggestions")
    public ResponseEntity<List<AiMarketingSuggestionDto>> getMarketingSuggestions() {
        return ResponseEntity.ok(marketingService.generateSuggestions());
    }

    @GetMapping("/sales-forecast")
    public ResponseEntity<AiSalesForecastDto> getSalesForecast(@RequestParam(required = false) Long branchId) {
        if (branchId != null) {
            securityUtils.validateBranchAccess(branchId);
        }
        return ResponseEntity.ok(forecastService.getForecast(branchId));
    }

    @GetMapping("/inventory-alerts")
    public ResponseEntity<List<AiInventoryAlertDto>> getInventoryAlerts(@RequestParam(required = false) Long branchId) {
        if (branchId != null) {
            securityUtils.validateBranchAccess(branchId);
        }
        return ResponseEntity.ok(inventoryPredictionService.getAlerts(branchId));
    }
}
