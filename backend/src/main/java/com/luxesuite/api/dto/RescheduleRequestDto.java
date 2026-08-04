package com.luxesuite.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RescheduleRequestDto {
    @NotNull(message = "New start time is required")
    private LocalDateTime newStartTime;
}
