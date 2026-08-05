package com.luxesuite.api.dto;

import com.luxesuite.api.model.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateAppointmentStatusDto {
    @NotNull(message = "Status is required")
    private AppointmentStatus status;
}
