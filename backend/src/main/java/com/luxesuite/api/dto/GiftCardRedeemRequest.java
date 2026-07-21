package com.luxesuite.api.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class GiftCardRedeemRequest {
    private String code;
    private BigDecimal amount;
    private Long invoiceId;
}
