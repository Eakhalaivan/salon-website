package com.luxesuite.api.repository;

import com.luxesuite.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"role", "branch"})
    Optional<User> findByEmail(String email);
    
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"role", "branch"})
    Optional<User> findById(Long id);
    
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
}
