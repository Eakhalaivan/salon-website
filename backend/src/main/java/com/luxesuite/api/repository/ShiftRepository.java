package com.luxesuite.api.repository;

import com.luxesuite.api.model.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {
    List<Shift> findByStaffId(Long staffId);
    List<Shift> findByBranchId(Long branchId);
    List<Shift> findByStaffIdAndStartTimeBetween(Long staffId, LocalDateTime start, LocalDateTime end);
    List<Shift> findByBranchIdAndStartTimeBetween(Long branchId, LocalDateTime start, LocalDateTime end);
}
