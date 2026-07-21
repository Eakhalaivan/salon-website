package com.luxesuite.api.repository;

import com.luxesuite.api.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProductIdAndBranchId(Long productId, Long branchId);
    java.util.List<Inventory> findByBranchId(Long branchId);
    
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"product", "branch"})
    org.springframework.data.domain.Page<Inventory> findAll(org.springframework.data.domain.Pageable pageable);
}
