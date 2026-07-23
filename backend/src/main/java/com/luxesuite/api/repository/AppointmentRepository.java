package com.luxesuite.api.repository;

import com.luxesuite.api.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"customer", "branch"})
    @org.springframework.data.jpa.repository.Query("SELECT a FROM Appointment a WHERE a.branch.id = :branchId AND a.createdAt BETWEEN :start AND :end AND a.businessType IN :types")
    Page<Appointment> findByBranchIdAndCreatedAtBetweenAndBusinessTypeIn(@org.springframework.data.repository.query.Param("branchId") Long branchId, @org.springframework.data.repository.query.Param("start") LocalDateTime start, @org.springframework.data.repository.query.Param("end") LocalDateTime end, @org.springframework.data.repository.query.Param("types") List<String> types, Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"customer", "branch"})
    @org.springframework.data.jpa.repository.Query("SELECT a FROM Appointment a WHERE a.createdAt BETWEEN :start AND :end AND a.businessType IN :types")
    Page<Appointment> findByCreatedAtBetweenAndBusinessTypeIn(@org.springframework.data.repository.query.Param("start") LocalDateTime start, @org.springframework.data.repository.query.Param("end") LocalDateTime end, @org.springframework.data.repository.query.Param("types") List<String> types, Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"customer", "branch"})
    Page<Appointment> findByBranchIdAndCreatedAtBetween(Long branchId, LocalDateTime start, LocalDateTime end, Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"customer", "branch"})
    Page<Appointment> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"customer", "branch", "services"})
    List<Appointment> findByCustomerId(Long customerId);
    
    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT a FROM Appointment a JOIN a.services s WHERE a.status = 'CONFIRMED' AND s.startTime BETWEEN :now AND :targetTime AND a.reminderSentAt IS NULL")
    List<Appointment> findUpcomingForReminder(@org.springframework.data.repository.query.Param("now") LocalDateTime now, @org.springframework.data.repository.query.Param("targetTime") LocalDateTime targetTime);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"customer", "branch", "services"})
    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT a FROM Appointment a JOIN a.services s WHERE s.staff.id = :staffId AND s.startTime >= :startOfDay AND s.startTime < :endOfDay ORDER BY a.createdAt ASC")
    List<Appointment> findAppointmentsByStaffAndDate(@org.springframework.data.repository.query.Param("staffId") Long staffId, @org.springframework.data.repository.query.Param("startOfDay") LocalDateTime startOfDay, @org.springframework.data.repository.query.Param("endOfDay") LocalDateTime endOfDay);

    long countByBranchId(Long branchId);
}
