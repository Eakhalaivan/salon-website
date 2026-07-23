package com.luxesuite.api.repository;

import com.luxesuite.api.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByIsApprovedTrue(Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT AVG(r.rating) FROM Review r WHERE r.customer.id IN (SELECT DISTINCT a.customer.id FROM Appointment a WHERE a.branch.id = :branchId)")
    Double getAverageRatingByBranchId(@org.springframework.data.repository.query.Param("branchId") Long branchId);
}
