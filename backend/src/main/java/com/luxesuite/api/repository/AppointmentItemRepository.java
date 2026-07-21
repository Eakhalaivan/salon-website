package com.luxesuite.api.repository;

import com.luxesuite.api.model.AppointmentItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentItemRepository extends JpaRepository<AppointmentItem, Long> {
    
    @Query("SELECT ai FROM AppointmentItem ai WHERE ai.staff.id = :staffId " +
           "AND ((ai.startTime >= :start AND ai.startTime < :end) OR " +
           "(ai.endTime > :start AND ai.endTime <= :end) OR " +
           "(ai.startTime <= :start AND ai.endTime >= :end)) " +
           "AND ai.status != 'CANCELLED'")
    List<AppointmentItem> findOverlappingAppointments(
            @Param("staffId") Long staffId, 
            @Param("start") LocalDateTime start, 
            @Param("end") LocalDateTime end
    );

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"service", "staff"})
    List<AppointmentItem> findByAppointmentIdIn(List<Long> appointmentIds);
}
