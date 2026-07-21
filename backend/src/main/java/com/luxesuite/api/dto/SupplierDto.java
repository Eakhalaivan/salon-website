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
public class SupplierDto {
    private Long id;

    @NotBlank(message = "Supplier name is required")
    private String name;

    private String contactEmail;
    private String contactPhone;
    private String address;
    private Boolean active;
    private LocalDateTime createdAt;
}
