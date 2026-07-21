package com.luxesuite.api.repository;

import com.luxesuite.api.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStaffId(Long staffId);
    List<Attendance> findByStaffIdAndDateBetween(Long staffId, LocalDate start, LocalDate end);
    Optional<Attendance> findByStaffIdAndDate(Long staffId, LocalDate date);
    List<Attendance> findByDate(LocalDate date);
    List<Attendance> findByShiftId(Long shiftId);
}
