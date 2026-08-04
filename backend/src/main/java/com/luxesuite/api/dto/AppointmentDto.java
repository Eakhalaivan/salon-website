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
    
    private String customerFirstName;
    private String customerLastName;
    
    private AppointmentStatus status;
    private BigDecimal totalPrice;
    private String notes;
    private LocalDateTime createdAt;
    
    private String cancellationReason;
    private Boolean isWalkIn;
    private String businessType;
    private BigDecimal depositAmount;
    private Boolean isDepositPaid;
    
    // Guest checkout fields
    private String guestFirstName;
    private String guestLastName;
    private String guestEmail;
    private String guestPhone;
    
    @NotNull(message = "Services are required")
    @Valid
    private List<AppointmentItemDto> services;
}
