package com.luxesuite.api.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class WalletDto {
    private Long id;
    private Long customerId;
    private BigDecimal balance;
}
