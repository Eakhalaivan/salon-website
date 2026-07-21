package com.luxesuite.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiSalesForecastDto {
    private BigDecimal currentWeekRevenue;
    private BigDecimal projectedNextWeekRevenue;
    private double weekOverWeekGrowthPercentage;
    private String aiSummary;
    private List<BigDecimal> historicalTrend;
}
