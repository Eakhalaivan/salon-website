package com.luxesuite.api.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PayrollGenerateRequest {
    private Long staffId;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
}
