package com.luxesuite.api.dto;

import com.luxesuite.api.model.ShiftType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ShiftRequest {
    private Long staffId;
    private Long branchId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ShiftType type;
}
