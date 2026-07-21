package com.luxesuite.api.repository;

import com.luxesuite.api.model.ShiftSwapRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShiftSwapRequestRepository extends JpaRepository<ShiftSwapRequest, Long> {
    List<ShiftSwapRequest> findByRequesterStaffId(Long staffId);
    List<ShiftSwapRequest> findByTargetStaffId(Long staffId);
}
