package com.luxesuite.api.repository;

import com.luxesuite.api.model.LoyaltyTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoyaltyTransactionRepository extends JpaRepository<LoyaltyTransaction, Long> {
    Page<LoyaltyTransaction> findByCustomerId(Long customerId, Pageable pageable);
    boolean existsByRelatedInvoiceId(Long invoiceId);
}
