package com.luxesuite.api.controller;

import com.luxesuite.api.dto.ShiftDto;
import com.luxesuite.api.dto.ShiftRequest;
import com.luxesuite.api.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @PostMapping("/shifts")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ShiftDto> createShift(@RequestBody ShiftRequest request) {
        return ResponseEntity.ok(scheduleService.createShift(request));
    }

    @PostMapping("/shifts/publish")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> publishShifts(@RequestBody List<Long> shiftIds) {
        scheduleService.publishShifts(shiftIds);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/staff/{staffId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'THERAPIST')")
    public ResponseEntity<List<ShiftDto>> getStaffShifts(@PathVariable Long staffId) {
        return ResponseEntity.ok(scheduleService.getShiftsForStaff(staffId));
    }

    @GetMapping("/branch/{branchId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<ShiftDto>> getBranchShifts(@PathVariable Long branchId) {
        return ResponseEntity.ok(scheduleService.getShiftsForBranch(branchId));
    }
}
