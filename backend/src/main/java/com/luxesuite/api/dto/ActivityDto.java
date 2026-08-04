package com.luxesuite.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityDto {
    private String type; // "APPOINTMENT", "ORDER", "LOYALTY"
    private String title;
    private String description;
    private LocalDateTime date;
    private String icon; // e.g. "event_available", "shopping_cart", "loyalty"
}
