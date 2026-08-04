package com.luxesuite.api.repository;

import com.luxesuite.api.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
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

    // Birthday query: find customers whose date_of_birth matches a given month and day
    @org.springframework.data.jpa.repository.Query("SELECT c FROM Customer c WHERE c.dateOfBirth IS NOT NULL AND EXTRACT(MONTH FROM c.dateOfBirth) = :month AND EXTRACT(DAY FROM c.dateOfBirth) = :day")
    List<Customer> findByBirthdayMonthAndDay(@org.springframework.data.repository.query.Param("month") int month, @org.springframework.data.repository.query.Param("day") int day);
}

