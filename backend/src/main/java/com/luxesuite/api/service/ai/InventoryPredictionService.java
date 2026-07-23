package com.luxesuite.api.service.ai;

import com.luxesuite.api.dto.AiInventoryAlertDto;
import com.luxesuite.api.model.Inventory;
import com.luxesuite.api.repository.InventoryRepository;
import com.luxesuite.api.repository.InventoryTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryPredictionService {

    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;

    public List<AiInventoryAlertDto> getAlerts(Long branchId) {
        // Deterministic logic: no AI calls here to avoid hallucinated stock levels.
        List<Inventory> allInventory = branchId != null 
            ? inventoryRepository.findByBranchId(branchId) 
            : inventoryRepository.findAll();
            
        return allInventory.stream()
            .filter(inv -> inv.getQuantity() <= (inv.getReorderLevel() != null ? inv.getReorderLevel() : 0) + 5) // Simple threshold buffer
            .map(inv -> {
                // Calculate historical burn rate over 30 days
                Integer totalUsage = inventoryTransactionRepository.sumUsageByProductAndBranchSince(
                    inv.getProduct().getId(), 
                    inv.getBranch().getId(), 
                    LocalDateTime.now().minusDays(30)
                );
                
                int burnRatePerDay = (totalUsage == null || totalUsage == 0) ? 2 : Math.max(1, totalUsage / 30);
                int daysRemaining = inv.getQuantity() / burnRatePerDay;
                
                AiInventoryAlertDto.AiInventoryAlertDtoBuilder builder = AiInventoryAlertDto.builder()
                        .productId(inv.getProduct().getId())
                        .productName(inv.getProduct().getName())
                        .currentStock(inv.getQuantity())
                        .reorderLevel(inv.getReorderLevel())
                        .estimatedDaysRemaining(daysRemaining);
                        
                // Optional: we can add dataQuality indicator if AiInventoryAlertDto has it, but it might not.
                
                return builder.build();
            })
            .collect(Collectors.toList());
    }
}
