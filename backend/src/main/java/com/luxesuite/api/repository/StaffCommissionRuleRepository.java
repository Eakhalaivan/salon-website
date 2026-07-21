package com.luxesuite.api.repository;

import com.luxesuite.api.model.StaffCommissionRule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffCommissionRuleRepository extends JpaRepository<StaffCommissionRule, Long> {
    Page<StaffCommissionRule> findByStaffId(Long staffId, Pageable pageable);
}
