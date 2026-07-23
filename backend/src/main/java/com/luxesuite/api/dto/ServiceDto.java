package com.luxesuite.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;
import java.io.Serializable;

@Data
public class ServiceDto implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;

    @NotBlank(message = "Service name is required")
    private String name;

    private String description;

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be positive")
    private Integer durationMins;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;

    private Boolean isActive;
    
    private String genderCategory;
    
    private String category;
    
    private String businessType;
}
