package com.luxesuite.api.repository;

import com.luxesuite.api.model.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {
    Page<SubscriptionPlan> findByIsActiveTrue(Pageable pageable);
    
    @org.springframework.data.jpa.repository.Query("SELECT s FROM SubscriptionPlan s WHERE s.isActive = true AND s.businessType IN :types")
    Page<SubscriptionPlan> findByIsActiveTrueAndBusinessTypeIn(@org.springframework.data.repository.query.Param("types") List<String> types, Pageable pageable);
}
