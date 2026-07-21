package com.luxesuite.api.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class WalletTopupRequest {
    private BigDecimal amount;
}
