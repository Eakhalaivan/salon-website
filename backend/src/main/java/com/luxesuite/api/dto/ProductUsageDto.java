package com.luxesuite.api.dto;

import lombok.Data;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Data
public class ProductUsageDto {
    @NotNull
    private Long productId;
    
    @Min(1)
    private int quantity;
}
