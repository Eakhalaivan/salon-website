package com.luxesuite.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyDto {
    private Long id;
    private Long customerId;
    private Integer pointsBalance;
    private PageResponse<LoyaltyTransactionDto> transactions;
    private LocalDateTime updatedAt;
}
