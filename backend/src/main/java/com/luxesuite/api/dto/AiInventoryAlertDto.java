package com.luxesuite.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiInventoryAlertDto {
    private Long productId;
    private String productName;
    private Integer currentStock;
    private Integer reorderLevel;
    private Integer estimatedDaysRemaining;
}
