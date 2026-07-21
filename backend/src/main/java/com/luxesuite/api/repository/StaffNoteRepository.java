package com.luxesuite.api.repository;

import com.luxesuite.api.model.StaffNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StaffNoteRepository extends JpaRepository<StaffNote, Long> {
    Optional<StaffNote> findByStaffId(Long staffId);
}
