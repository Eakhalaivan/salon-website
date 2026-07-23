package com.luxesuite.api.controller;

import com.luxesuite.api.dto.StaffDto;
import com.luxesuite.api.service.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.luxesuite.api.security.SecurityUtils;

import java.util.List;

@RestController
@RequestMapping("/api/v1/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;
    private final SecurityUtils securityUtils;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public com.luxesuite.api.dto.PageResponse<StaffDto> getAllStaff(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String businessType
    ) {
        if (securityUtils.hasRole("MANAGER")) {
            Long branchId = securityUtils.getStaffBranchId();
            return staffService.getStaffByBranch(branchId, page, size, businessType);
        }
        return staffService.getAllStaff(page, size, businessType);
    }

    @GetMapping("/branch/{branchId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @org.springframework.cache.annotation.Cacheable(value = "staff", key = "'branch_' + #branchId + '_' + #page + '_' + #size + '_' + #businessType")
    public com.luxesuite.api.dto.PageResponse<StaffDto> getStaffByBranch(
            @PathVariable Long branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String businessType
    ) {
        return staffService.getStaffByBranch(branchId, page, size, businessType);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @org.springframework.cache.annotation.Cacheable(value = "staff", key = "#id")
    public StaffDto getStaffById(@PathVariable Long id) {
        return staffService.getStaffById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @org.springframework.cache.annotation.CacheEvict(value = "staff", allEntries = true)
    public ResponseEntity<StaffDto> createStaff(@Valid @RequestBody StaffDto dto) {
        return new ResponseEntity<>(staffService.createStaff(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @org.springframework.cache.annotation.CacheEvict(value = "staff", allEntries = true)
    public ResponseEntity<StaffDto> updateStaff(@PathVariable Long id, @Valid @RequestBody StaffDto dto) {
        return ResponseEntity.ok(staffService.updateStaff(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @org.springframework.cache.annotation.CacheEvict(value = "staff", allEntries = true)
    public ResponseEntity<Void> deleteStaff(@PathVariable Long id) {
        staffService.deleteStaff(id);
        return ResponseEntity.noContent().build();
    }
}
