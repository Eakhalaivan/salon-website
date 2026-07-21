package com.luxesuite.api.dto;

import com.luxesuite.api.model.ShiftStatus;
import com.luxesuite.api.model.ShiftType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ShiftDto {
    private Long id;
    private Long staffId;
    private String staffName;
    private Long branchId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ShiftType type;
    private ShiftStatus status;
}
