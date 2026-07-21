package com.luxesuite.api.repository;

import com.luxesuite.api.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByEmail(String email);
    Optional<Customer> findByReferralCode(String referralCode);
    boolean existsByReferralCode(String referralCode);
    Optional<Customer> findByPhone(String phone);
    Optional<Customer> findByUserId(Long userId);
    
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user"})
    org.springframework.data.domain.Page<Customer> findAll(org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user"})
    @org.springframework.data.jpa.repository.Query("SELECT c FROM Customer c WHERE LOWER(c.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')) OR c.phone LIKE CONCAT('%', :search, '%')")
    org.springframework.data.domain.Page<Customer> searchCustomers(@org.springframework.data.repository.query.Param("search") String search, org.springframework.data.domain.Pageable pageable);
}
