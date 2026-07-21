package com.luxesuite.api.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class StaffCommissionRuleDto {
    private Long id;
    private Long staffId;
    private Long serviceId;
    private String commissionType;
    private BigDecimal commissionValue;
}
