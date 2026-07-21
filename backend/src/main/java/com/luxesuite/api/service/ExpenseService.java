package com.luxesuite.api.service;

import com.luxesuite.api.dto.ExpenseDto;
import com.luxesuite.api.dto.PageResponse;
import com.luxesuite.api.exception.ResourceNotFoundException;
import com.luxesuite.api.model.Branch;
import com.luxesuite.api.model.Expense;
import com.luxesuite.api.model.Supplier;
import com.luxesuite.api.model.User;
import com.luxesuite.api.repository.BranchRepository;
import com.luxesuite.api.repository.ExpenseRepository;
import com.luxesuite.api.repository.SupplierRepository;
import com.luxesuite.api.repository.UserRepository;
import com.luxesuite.api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final SupplierRepository supplierRepository;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public PageResponse<ExpenseDto> listExpenses(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("expenseDate").descending());
        Page<Expense> expensePage = expenseRepository.findAll(pageable);
        return new PageResponse<>(
                expensePage.getContent().stream().map(this::mapToDto).collect(Collectors.toList()),
                expensePage.getNumber(),
                expensePage.getSize(),
                expensePage.getTotalElements(),
                expensePage.getTotalPages(),
                expensePage.isLast()
        );
    }

    @Transactional
    public ExpenseDto createExpense(ExpenseDto dto) {
        Supplier supplier = null;
        if (dto.getSupplierId() != null) {
            supplier = supplierRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
        }

        Branch branch = null;
        if (dto.getBranchId() != null) {
            branch = branchRepository.findById(dto.getBranchId())
                    .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
        }

        User currentUser = userRepository.findByEmail(securityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Expense expense = Expense.builder()
                .category(dto.getCategory())
                .amount(dto.getAmount())
                .description(dto.getDescription())
                .supplier(supplier)
                .branch(branch)
                .expenseDate(dto.getExpenseDate() != null ? dto.getExpenseDate() : LocalDate.now())
                .createdBy(currentUser)
                .build();

        return mapToDto(expenseRepository.save(expense));
    }

    private ExpenseDto mapToDto(Expense expense) {
        return ExpenseDto.builder()
                .id(expense.getId())
                .category(expense.getCategory())
                .amount(expense.getAmount())
                .description(expense.getDescription())
                .supplierId(expense.getSupplier() != null ? expense.getSupplier().getId() : null)
                .supplierName(expense.getSupplier() != null ? expense.getSupplier().getName() : null)
                .branchId(expense.getBranch() != null ? expense.getBranch().getId() : null)
                .expenseDate(expense.getExpenseDate())
                .createdById(expense.getCreatedBy() != null ? expense.getCreatedBy().getId() : null)
                .createdAt(expense.getCreatedAt())
                .build();
    }
}
