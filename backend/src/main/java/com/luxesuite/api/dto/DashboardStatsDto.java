package com.luxesuite.api.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DashboardStatsDto {
    private long totalAppointmentsToday;
    private long newCustomersThisMonth;
    private BigDecimal revenueToday;
    private BigDecimal revenueThisMonth;
}
