package com.luxesuite.api.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class JobOpeningDto {
    private Long id;
    private String title;
    private String department;
    private String location;
    private String description;
    private String employmentType;
    private Boolean active;
}
