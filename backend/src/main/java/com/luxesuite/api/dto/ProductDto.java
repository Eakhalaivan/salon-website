package com.luxesuite.api.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private Long id;
    @NotBlank(message = "Product name is required")
    private String name;
    
    @NotBlank(message = "SKU is required")
    private String sku;
    
    @NotBlank(message = "Type is required")
    private String type; // RETAIL, BACKBAR
    
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;

    private BigDecimal cost;
    private Boolean isActive;
    private String businessType;
    private Integer stockQuantity;
}
