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
            List<InventoryDto> list = inventoryService.getInventoryByBranch(branchId);
            // Quick workaround to page list. In real prod, create a paged getInventoryByBranch query.
            int start = Math.min((int)PageRequest.of(page, size).getOffset(), list.size());
            int end = Math.min((start + size), list.size());
            org.springframework.data.domain.Page<InventoryDto> paged = new PageImpl<>(list.subList(start, end), PageRequest.of(page, size), list.size());
            return ResponseEntity.ok(com.luxesuite.api.dto.PageResponse.of(paged));
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
