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
public class CmsContentBlockDto {
    private Long id;
    
    @NotBlank
    private String pageKey;
    
    @NotBlank
    private String blockKey;
    
    @NotBlank
    private String contentType;
    
    private String contentValue;
    private Long updatedBy;
    private LocalDateTime updatedAt;
}
