package com.luxesuite.api.repository;

import com.luxesuite.api.model.CustomerNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerNoteRepository extends JpaRepository<CustomerNote, Long> {
    
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"author", "author.user"})
    List<CustomerNote> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
