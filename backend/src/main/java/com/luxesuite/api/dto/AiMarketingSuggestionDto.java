package com.luxesuite.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiMarketingSuggestionDto {
    private String idea;
    private String rationale;
    private String suggestedTargetAudience;
    private String suggestedCouponCode;
}
