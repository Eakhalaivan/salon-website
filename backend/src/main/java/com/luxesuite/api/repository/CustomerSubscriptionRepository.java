package com.luxesuite.api.repository;

import com.luxesuite.api.model.CustomerSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface CustomerSubscriptionRepository extends JpaRepository<CustomerSubscription, Long> {
    Page<CustomerSubscription> findByCustomerIdAndStatus(Long customerId, String status, Pageable pageable);
    List<CustomerSubscription> findByCustomerIdAndStatus(Long customerId, String status);
    boolean existsByCustomerIdAndStatus(Long customerId, String status);
}
