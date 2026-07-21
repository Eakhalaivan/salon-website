package com.luxesuite.api.repository;

import com.luxesuite.api.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByCustomerId(Long customerId);
    List<Invoice> findByBranchIdAndCreatedAtBetween(Long branchId, LocalDateTime start, LocalDateTime end);
    List<Invoice> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"customer", "customer.user", "branch", "appointment"})
    Page<Invoice> findAll(Pageable pageable);

    @Query("SELECT i FROM Invoice i WHERE i.customer.id = :customerId ORDER BY i.createdAt DESC")
    Page<Invoice> findByCustomerId(@Param("customerId") Long customerId, Pageable pageable);

    @Query("SELECT i FROM Invoice i WHERE i.branch.id = :branchId ORDER BY i.createdAt DESC")
    Page<Invoice> findByBranchId(@Param("branchId") Long branchId, Pageable pageable);
    
    long countByCustomerIdAndStatus(Long customerId, String status);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"customer", "customer.user", "branch", "appointment"})
    @Query("SELECT i FROM Invoice i WHERE i.customer.user.id = :userId")
    Page<Invoice> findByCustomerUserId(@Param("userId") Long userId, Pageable pageable);
}
