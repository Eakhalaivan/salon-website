package com.luxesuite.api.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReferralDto {
    private Long id;
    private Long referrerCustomerId;
    private Long referredCustomerId;
    private String code;
    private String status;
    private Boolean rewardIssued;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
