package com.luxesuite.api.repository;

import com.luxesuite.api.model.PayrollRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PayrollRecordRepository extends JpaRepository<PayrollRecord, Long> {
    Page<PayrollRecord> findByStaffId(Long staffId, Pageable pageable);
}
