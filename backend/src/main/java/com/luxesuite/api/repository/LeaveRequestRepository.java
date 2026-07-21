package com.luxesuite.api.repository;

import com.luxesuite.api.model.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByStaffId(Long staffId);
    List<LeaveRequest> findByStaffBranchId(Long branchId);
}
