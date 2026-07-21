package com.luxesuite.api.repository;

import com.luxesuite.api.model.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    Page<Expense> findByExpenseDateBetween(LocalDate start, LocalDate end, Pageable pageable);
}
