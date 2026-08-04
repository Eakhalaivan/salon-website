package com.luxesuite.api.repository;

import com.luxesuite.api.model.Waitlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WaitlistRepository extends JpaRepository<Waitlist, Long> {
    List<Waitlist> findByBranchIdAndPreferredDateAndStatusOrderByCreatedAtAsc(Long branchId, LocalDate preferredDate, Waitlist.WaitlistStatus status);
}
