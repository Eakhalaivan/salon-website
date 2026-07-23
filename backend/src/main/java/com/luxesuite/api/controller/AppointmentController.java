package com.luxesuite.api.controller;

import com.luxesuite.api.dto.AppointmentDto;
import com.luxesuite.api.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import com.luxesuite.api.dto.PageResponse;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST', 'CUSTOMER')")
    public ResponseEntity<AppointmentDto> createAppointment(@Valid @RequestBody AppointmentDto request) {
        log.info("Creating appointment for customerId: {} with serviceIds: {}", request.getCustomerId(), request.getServices().stream().map(com.luxesuite.api.dto.AppointmentItemDto::getServiceId).toList());
        AppointmentDto created = appointmentService.createAppointment(request);
        log.info("Appointment created successfully with ID: {}", created.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/branch/{branchId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<PageResponse<AppointmentDto>> getAppointmentsByBranch(
            @PathVariable Long branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String businessType
    ) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByBranchAndDateRange(branchId, start, end, page, size, businessType));
    }

    @GetMapping("/staff/{staffId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST', 'STAFF')")
    public ResponseEntity<List<AppointmentDto>> getAppointmentsByStaff(
            @PathVariable Long staffId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date
    ) {
        LocalDateTime startOfDay = date.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return ResponseEntity.ok(appointmentService.getAppointmentsByStaffAndDate(staffId, startOfDay, endOfDay));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<AppointmentDto> completeAppointment(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) List<com.luxesuite.api.dto.ProductUsageDto> usedProducts
    ) {
        return ResponseEntity.ok(appointmentService.completeAppointment(id, usedProducts));
    }
}
