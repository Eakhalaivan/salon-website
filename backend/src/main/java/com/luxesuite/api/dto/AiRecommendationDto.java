package com.luxesuite.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiRecommendationDto {
    private Long serviceId;
    private String name;
    private BigDecimal price;
    private Integer durationMinutes;
    private String rationale;
}
