package com.luxesuite.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseDto {
    private Long id;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    private String description;
    private Long supplierId;
    private String supplierName;
    private Long branchId;
    
    @NotNull(message = "Expense date is required")
    private LocalDate expenseDate;
    
    private Long createdById;
    private LocalDateTime createdAt;
}
