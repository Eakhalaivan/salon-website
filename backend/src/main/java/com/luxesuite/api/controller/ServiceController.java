package com.luxesuite.api.controller;

import com.luxesuite.api.dto.ServiceDto;
import com.luxesuite.api.service.SalonServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/services")
@RequiredArgsConstructor
public class ServiceController {

    private final SalonServiceService salonService;

    @GetMapping
    public ResponseEntity<com.luxesuite.api.dto.PageResponse<ServiceDto>> getAllServices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(salonService.getAllServices(page, size));
    }

    @GetMapping("/active")
    public ResponseEntity<com.luxesuite.api.dto.PageResponse<ServiceDto>> getActiveServices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(salonService.getActiveServices(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceDto> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(salonService.getServiceById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ServiceDto> createService(@Valid @RequestBody ServiceDto dto) {
        return new ResponseEntity<>(salonService.createService(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ServiceDto> updateService(@PathVariable Long id, @Valid @RequestBody ServiceDto dto) {
        return ResponseEntity.ok(salonService.updateService(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        salonService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}
