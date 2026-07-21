package com.luxesuite.api.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class GiftCardPurchaseRequest {
    private BigDecimal amount;
    private String recipientEmail;
    private String recipientName;
}
