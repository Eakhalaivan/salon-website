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
public class WhatsAppMessageLogDto {
    private Long id;
    private Long customerId;
    private String customerName;
    private String phoneNumber;
    private String templateName;
    private String status;
    private String relatedEntityType;
    private Long relatedEntityId;
    private LocalDateTime createdAt;
}
