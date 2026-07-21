package com.luxesuite.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSubscriptionDto {
    private Long id;
    private Long customerId;
    private SubscriptionPlanDto plan;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private BigDecimal remainingBalance;
    private String status;
}
