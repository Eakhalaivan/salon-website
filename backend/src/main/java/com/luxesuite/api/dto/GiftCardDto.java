package com.luxesuite.api.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class GiftCardDto {
    private Long id;
    private String code;
    private BigDecimal initialBalance;
    private BigDecimal currentBalance;
    private Long purchasedByCustomerId;
    private String recipientEmail;
    private String recipientName;
    private String status;
    private LocalDateTime issuedAt;
    private LocalDateTime expiresAt;
    
    // New fields for admin-gifted cards
    private String message;
    private String sentByAdminName;
    private Long recipientCustomerId;
    private LocalDateTime redeemedAt;
    private String source;
}
