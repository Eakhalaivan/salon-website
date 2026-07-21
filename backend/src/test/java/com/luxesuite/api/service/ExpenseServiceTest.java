package com.luxesuite.api.service;

import com.luxesuite.api.dto.ExpenseDto;
import com.luxesuite.api.model.Expense;
import com.luxesuite.api.model.User;
import com.luxesuite.api.repository.BranchRepository;
import com.luxesuite.api.repository.ExpenseRepository;
import com.luxesuite.api.repository.SupplierRepository;
import com.luxesuite.api.repository.UserRepository;
import com.luxesuite.api.security.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private BranchRepository branchRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityUtils securityUtils;

    @InjectMocks
    private ExpenseService expenseService;

    private Expense expense;

    @BeforeEach
    void setUp() {
        expense = new Expense();
        expense.setId(1L);
        expense.setCategory("Supplies");
        expense.setAmount(new BigDecimal("150.00"));
        expense.setExpenseDate(LocalDate.now());
        expense.setDescription("Shampoo and conditioner");
    }

    @Test
    void testCreateExpense() {
        when(expenseRepository.save(any(Expense.class))).thenReturn(expense);
        when(securityUtils.getCurrentUserEmail()).thenReturn("admin@example.com");

        User mockUser = new User();
        mockUser.setId(1L);
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(mockUser));

        ExpenseDto dto = new ExpenseDto();
        dto.setCategory("Supplies");
        dto.setAmount(new BigDecimal("150.00"));

        ExpenseDto result = expenseService.createExpense(dto);
        assertNotNull(result);
        assertEquals(new BigDecimal("150.00"), result.getAmount());
    }
}
