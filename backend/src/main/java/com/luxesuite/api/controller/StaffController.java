package com.luxesuite.api.controller;

import com.luxesuite.api.dto.StaffDto;
import com.luxesuite.api.service.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @org.springframework.cache.annotation.Cacheable(value = "staff", key = "'all_' + #page + '_' + #size")
    public com.luxesuite.api.dto.PageResponse<StaffDto> getAllStaff(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return staffService.getAllStaff(page, size);
    }

    @GetMapping("/branch/{branchId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @org.springframework.cache.annotation.Cacheable(value = "staff", key = "'branch_' + #branchId + '_' + #page + '_' + #size")
    public com.luxesuite.api.dto.PageResponse<StaffDto> getStaffByBranch(
            @PathVariable Long branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return staffService.getStaffByBranch(branchId, page, size);
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
