package com.luxesuite.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Set;

@Data
public class StaffDto {
    private Long id;
    
    private Long userId; // Optional if creating a new user

    @jakarta.validation.constraints.Email(message = "Invalid email format")
    private String email;
    
    @jakarta.validation.constraints.NotBlank(message = "First name is required")
    private String firstName;
    
    @jakarta.validation.constraints.NotBlank(message = "Last name is required")
    private String lastName;
    
    private String phone;
    
    @jakarta.validation.constraints.NotBlank(message = "Role name is required")
    private String roleName; // E.g., STAFF, MANAGER, RECEPTIONIST

    @NotNull(message = "Branch ID is required")
    private Long branchId;

    private BigDecimal baseSalary;
    private BigDecimal commissionRate;
    
    // IDs of services this staff can perform
    private Set<Long> serviceIds;

    private String businessType;
}
