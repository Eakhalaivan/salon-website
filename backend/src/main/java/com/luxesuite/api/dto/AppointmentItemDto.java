package com.luxesuite.api.dto;

import com.luxesuite.api.model.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class AppointmentItemDto {
    private Long id;
    
    @NotNull(message = "Service ID is required")
    private Long serviceId;
    
    @NotNull(message = "Staff ID is required")
    private Long staffId;
    
    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;
    
    private LocalDateTime endTime; // Usually calculated
    
    private AppointmentStatus status;
    private BigDecimal price; // Snapshotted at booking time
}
