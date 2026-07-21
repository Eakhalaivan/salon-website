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
public class LoyaltyTransactionDto {
    private Long id;
    private Integer pointsDelta;
    private String reason;
    private Long relatedInvoiceId;
    private LocalDateTime createdAt;
}
