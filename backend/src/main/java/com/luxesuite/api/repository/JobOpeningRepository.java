package com.luxesuite.api.repository;

import com.luxesuite.api.model.JobOpening;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobOpeningRepository extends JpaRepository<JobOpening, Long> {
    Page<JobOpening> findByActive(Boolean active, Pageable pageable);
}
