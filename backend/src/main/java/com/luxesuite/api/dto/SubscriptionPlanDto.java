package com.luxesuite.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlanDto {
    private Long id;
    private String name;
    private String description;
    private Integer validityDays;
    private BigDecimal price;
    private BigDecimal discountRate;
    private String planType;
    private Integer totalSessions;
}
