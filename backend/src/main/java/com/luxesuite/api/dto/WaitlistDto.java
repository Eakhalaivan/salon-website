package com.luxesuite.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class WaitlistDto {
    private Long id;

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Branch ID is required")
    private Long branchId;

    @NotNull(message = "Service ID is required")
    private Long serviceId;

    @NotNull(message = "Preferred date is required")
    private LocalDate preferredDate;

    private String status;
    private LocalDateTime createdAt;
}
