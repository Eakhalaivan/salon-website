package com.luxesuite.api.service.ai;

import com.luxesuite.api.dto.AiInventoryAlertDto;
import com.luxesuite.api.model.Inventory;
import com.luxesuite.api.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryPredictionService {

    private final InventoryRepository inventoryRepository;

    public List<AiInventoryAlertDto> getAlerts(Long branchId) {
        // Deterministic logic: no AI calls here to avoid hallucinated stock levels.
        List<Inventory> allInventory = branchId != null 
            ? inventoryRepository.findByBranchId(branchId) 
            : inventoryRepository.findAll();
            
        return allInventory.stream()
            .filter(inv -> inv.getQuantity() <= (inv.getReorderLevel() != null ? inv.getReorderLevel() : 0) + 5) // Simple threshold buffer
            .map(inv -> {
                // Mock calculation of days remaining based on historical burn rate
                int burnRatePerDay = 2; // In reality, calculate from InventoryTransaction
                int daysRemaining = inv.getQuantity() / burnRatePerDay;
                
                return AiInventoryAlertDto.builder()
                        .productId(inv.getProduct().getId())
                        .productName(inv.getProduct().getName())
                        .currentStock(inv.getQuantity())
                        .reorderLevel(inv.getReorderLevel())
                        .estimatedDaysRemaining(daysRemaining)
                        .build();
            })
            .collect(Collectors.toList());
    }
}
