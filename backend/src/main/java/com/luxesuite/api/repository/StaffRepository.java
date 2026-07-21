package com.luxesuite.api.repository;

import com.luxesuite.api.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    List<Staff> findByBranchId(Long branchId);
    java.util.Optional<Staff> findByUserId(Long userId);
    java.util.Optional<Staff> findByUserEmail(String email);
    
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT s FROM Staff s WHERE s.id = :id")
    java.util.Optional<Staff> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") Long id);
    
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user", "user.role", "branch"})
    Page<Staff> findByUserIsActiveTrue(Pageable pageable);
    
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user", "user.role", "branch"})
    Page<Staff> findByBranchIdAndUserIsActiveTrue(Long branchId, Pageable pageable);
}
