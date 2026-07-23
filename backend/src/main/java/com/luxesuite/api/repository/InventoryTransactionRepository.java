package com.luxesuite.api.repository;

import com.luxesuite.api.model.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {

    @Query("SELECT COALESCE(SUM(ABS(it.changeQty)), 0) FROM InventoryTransaction it WHERE it.product.id = :productId AND it.branch.id = :branchId AND it.changeQty < 0 AND it.createdAt >= :startDate")
    Integer sumUsageByProductAndBranchSince(@Param("productId") Long productId, @Param("branchId") Long branchId, @Param("startDate") java.time.LocalDateTime startDate);
}
