package com.luxesuite.api.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PayrollRecordDto {
    private Long id;
    private Long staffId;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private BigDecimal baseSalary;
    private BigDecimal commissionEarned;
    private Integer totalAppointmentsCompleted;
    private BigDecimal grossPay;
    private String status;
    private LocalDateTime generatedAt;
}
