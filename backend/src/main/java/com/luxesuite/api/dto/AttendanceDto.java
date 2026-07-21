package com.luxesuite.api.dto;

import com.luxesuite.api.model.AttendanceStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class AttendanceDto {
    private Long id;
    private Long staffId;
    private String staffName;
    private Long shiftId;
    private LocalDate date;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private AttendanceStatus status;
    private BigDecimal locationLat;
    private BigDecimal locationLng;
    private String notes;
}
