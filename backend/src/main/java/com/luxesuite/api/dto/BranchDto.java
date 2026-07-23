package com.luxesuite.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BranchDto {
    private Long id;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String address;
    private String taxId;
    private String timezone;
    private String phone;
    private Boolean isActive;
    
    private String businessType;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
