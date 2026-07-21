package com.luxesuite.api.repository;

import com.luxesuite.api.model.CommissionEarning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CommissionEarningRepository extends JpaRepository<CommissionEarning, Long> {
    @Query("SELECT c FROM CommissionEarning c WHERE c.staff.id = :staffId AND c.createdAt >= :startDate AND c.createdAt <= :endDate")
    List<CommissionEarning> findByStaffIdAndDateRange(
            @Param("staffId") Long staffId, 
            @Param("startDate") LocalDateTime startDate, 
            @Param("endDate") LocalDateTime endDate
    );
}
