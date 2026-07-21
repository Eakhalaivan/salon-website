package com.luxesuite.api.dto;

import com.luxesuite.api.model.AppointmentStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class AppointmentDto {
    private Long id;
    
    @NotNull(message = "Customer ID is required")
    private Long customerId;
    
    @NotNull(message = "Branch ID is required")
    private Long branchId;
    
    private AppointmentStatus status;
    private BigDecimal totalPrice;
    private String notes;
    private LocalDateTime createdAt;
    
    @NotEmpty(message = "At least one service must be booked")
    @Valid
    private List<AppointmentItemDto> services;
}
