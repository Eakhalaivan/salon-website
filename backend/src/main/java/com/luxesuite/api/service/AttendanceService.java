package com.luxesuite.api.service;

import com.luxesuite.api.dto.AttendanceDto;
import com.luxesuite.api.dto.ClockInRequest;
import com.luxesuite.api.model.*;
import com.luxesuite.api.repository.AttendanceRepository;
import com.luxesuite.api.repository.ShiftRepository;
import com.luxesuite.api.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final ShiftRepository shiftRepository;
    private final StaffRepository staffRepository;
    private final NotificationService notificationService;

    @Transactional
    public AttendanceDto clockIn(Long staffId, ClockInRequest request) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff not found"));
        
        LocalDate today = LocalDate.now();
        Optional<Attendance> existing = attendanceRepository.findByStaffIdAndDate(staffId, today);
        if (existing.isPresent()) {
            throw new IllegalStateException("Already clocked in for today");
        }

        // Find today's shift (if any)
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);
        List<Shift> todayShifts = shiftRepository.findByStaffIdAndStartTimeBetween(staffId, startOfDay, endOfDay);
        Shift currentShift = todayShifts.stream()
                .filter(s -> s.getStatus() == ShiftStatus.PUBLISHED)
                .findFirst()
                .orElse(null);

        AttendanceStatus status = AttendanceStatus.ON_TIME;
        LocalDateTime now = LocalDateTime.now();

        // Grace period logic (e.g., 10 mins late allowed)
        if (currentShift != null) {
            LocalDateTime graceLimit = currentShift.getStartTime().plusMinutes(10);
            if (now.isAfter(graceLimit)) {
                status = AttendanceStatus.LATE;
                // Notify manager
                notificationService.sendAppNotification(
                        staff.getUser(), // sending to the user for now, phase 2 will broadcast to manager
                        "Late Alert",
                        "You have clocked in late for your shift.",
                        NotificationType.LATE_ALERT
                );
            }
        }

        Attendance attendance = Attendance.builder()
                .staff(staff)
                .shift(currentShift)
                .date(today)
                .checkInTime(now)
                .status(status)
                .locationLat(request.getLocationLat())
                .locationLng(request.getLocationLng())
                .build();

        attendanceRepository.save(attendance);
        return mapToDto(attendance);
    }

    @Transactional
    public AttendanceDto clockOut(Long staffId) {
        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByStaffIdAndDate(staffId, today)
                .orElseThrow(() -> new IllegalStateException("No active clock-in found for today"));

        if (attendance.getCheckOutTime() != null) {
            throw new IllegalStateException("Already clocked out");
        }

        attendance.setCheckOutTime(LocalDateTime.now());
        attendanceRepository.save(attendance);
        return mapToDto(attendance);
    }

    public List<AttendanceDto> getAttendanceForStaff(Long staffId) {
        return attendanceRepository.findByStaffId(staffId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<AttendanceDto> getLiveAttendance() {
        return attendanceRepository.findByDate(LocalDate.now()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private AttendanceDto mapToDto(Attendance attendance) {
        AttendanceDto dto = new AttendanceDto();
        dto.setId(attendance.getId());
        dto.setStaffId(attendance.getStaff().getId());
        dto.setStaffName(attendance.getStaff().getUser().getFirstName() + " " + attendance.getStaff().getUser().getLastName());
        dto.setShiftId(attendance.getShift() != null ? attendance.getShift().getId() : null);
        dto.setDate(attendance.getDate());
        dto.setCheckInTime(attendance.getCheckInTime());
        dto.setCheckOutTime(attendance.getCheckOutTime());
        dto.setStatus(attendance.getStatus());
        dto.setLocationLat(attendance.getLocationLat());
        dto.setLocationLng(attendance.getLocationLng());
        dto.setNotes(attendance.getNotes());
        return dto;
    }
}
