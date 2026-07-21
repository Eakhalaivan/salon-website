package com.luxesuite.api.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ClockInRequest {
    private BigDecimal locationLat;
    private BigDecimal locationLng;
}
