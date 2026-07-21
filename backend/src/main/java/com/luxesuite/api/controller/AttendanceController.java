package com.luxesuite.api.controller;

import com.luxesuite.api.dto.AttendanceDto;
import com.luxesuite.api.dto.ClockInRequest;
import com.luxesuite.api.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/clock-in/{staffId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'THERAPIST')")
    public ResponseEntity<AttendanceDto> clockIn(@PathVariable Long staffId, @RequestBody ClockInRequest request) {
        return ResponseEntity.ok(attendanceService.clockIn(staffId, request));
    }

    @PostMapping("/clock-out/{staffId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'THERAPIST')")
    public ResponseEntity<AttendanceDto> clockOut(@PathVariable Long staffId) {
        return ResponseEntity.ok(attendanceService.clockOut(staffId));
    }

    @GetMapping("/staff/{staffId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'THERAPIST')")
    public ResponseEntity<List<AttendanceDto>> getAttendanceForStaff(@PathVariable Long staffId) {
        return ResponseEntity.ok(attendanceService.getAttendanceForStaff(staffId));
    }

    @GetMapping("/live")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<AttendanceDto>> getLiveAttendance() {
        return ResponseEntity.ok(attendanceService.getLiveAttendance());
    }
}
