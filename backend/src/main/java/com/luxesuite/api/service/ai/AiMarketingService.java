package com.luxesuite.api.service.ai;

import com.luxesuite.api.dto.AiMarketingSuggestionDto;
import com.luxesuite.api.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiMarketingService {

    private final AnalyticsService analyticsService;
    private final AiClientService aiClientService;

    public List<AiMarketingSuggestionDto> generateSuggestions() {
        // In a full implementation, we would pull real metrics from AnalyticsService.
        // For this example, we mock the analytics summary to pass to the AI.
        String businessContext = "Revenue is up 5% this month, but Hair treatments are down 10%. We have 50 lapsed customers who haven't visited in 60 days.";
        
        String systemPrompt = "You are a marketing strategist for a luxury salon. Provide exactly 2 short marketing campaign ideas based on the data provided. Format strictly as 'IDEA | RATIONALE | TARGET | COUPON_CODE', separated by newlines.";
        String userPrompt = "Recent data: " + businessContext;
        
        String aiResponse = aiClientService.complete(systemPrompt, userPrompt);
        
        if (aiResponse == null || aiResponse.trim().isEmpty()) {
            // Graceful fallback
            return List.of(
                AiMarketingSuggestionDto.builder()
                    .idea("Lapsed Customer Outreach")
                    .rationale("Standard fallback campaign for customers absent >60 days.")
                    .suggestedTargetAudience("Lapsed Customers")
                    .suggestedCouponCode("WELCOMEBACK10")
                    .build()
            );
        }
        
        // Parse the AI response (naive parsing for example purposes)
        try {
            return java.util.Arrays.stream(aiResponse.split("\n"))
                .filter(line -> line.contains("|"))
                .map(line -> {
                    String[] parts = line.split("\\|");
                    return AiMarketingSuggestionDto.builder()
                        .idea(parts.length > 0 ? parts[0].trim() : "Campaign")
                        .rationale(parts.length > 1 ? parts[1].trim() : "")
                        .suggestedTargetAudience(parts.length > 2 ? parts[2].trim() : "All")
                        .suggestedCouponCode(parts.length > 3 ? parts[3].trim() : "PROMO")
                        .build();
                })
                .collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            log.error("Failed to parse AI marketing response", e);
            return List.of(
                AiMarketingSuggestionDto.builder()
                    .idea("Lapsed Customer Outreach")
                    .rationale("Standard fallback campaign for customers absent >60 days.")
                    .suggestedTargetAudience("Lapsed Customers")
                    .suggestedCouponCode("WELCOMEBACK10")
                    .build()
            );
        }
    }
}
