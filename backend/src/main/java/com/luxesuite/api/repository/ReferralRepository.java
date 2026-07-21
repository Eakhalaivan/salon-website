package com.luxesuite.api.repository;

import com.luxesuite.api.model.Referral;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReferralRepository extends JpaRepository<Referral, Long> {
    Optional<Referral> findByCode(String code);
    Page<Referral> findByReferrerId(Long referrerId, Pageable pageable);
    Optional<Referral> findByReferredId(Long referredId);
}
