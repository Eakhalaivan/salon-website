package com.luxesuite.api.controller;

import com.luxesuite.api.dto.InventoryDto;
import com.luxesuite.api.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.luxesuite.api.security.SecurityUtils;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;
    private final SecurityUtils securityUtils;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<com.luxesuite.api.dto.PageResponse<InventoryDto>> getAllInventory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        if (securityUtils.hasRole("MANAGER")) {
            Long branchId = securityUtils.getStaffBranchId();
            return ResponseEntity.ok(inventoryService.getInventoryByBranch(branchId, page, size));
        }
        return ResponseEntity.ok(inventoryService.getAllInventory(page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<InventoryDto> getInventoryById(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getInventoryById(id));
    }

    @PostMapping("/adjust")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<InventoryDto> adjustStock(
            @RequestParam Long productId,
            @RequestParam Long branchId,
            @RequestParam int quantityAdjustment
    ) {
        return ResponseEntity.ok(inventoryService.updateStock(productId, branchId, quantityAdjustment));
    }
}
