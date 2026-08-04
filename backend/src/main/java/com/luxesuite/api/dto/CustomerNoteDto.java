package com.luxesuite.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CustomerNoteDto {
    private Long id;
    
    private Long customerId;
    
    private Long staffId;
    
    private String staffName;
    
    @NotBlank(message = "Note content is required")
    private String content;
    
    private LocalDateTime createdAt;
}
