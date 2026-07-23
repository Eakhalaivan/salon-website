package com.luxesuite.api.controller;

import com.luxesuite.api.model.BranchSettings;
import com.luxesuite.api.model.Staff;
import com.luxesuite.api.repository.BranchSettingsRepository;
import com.luxesuite.api.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.access.prepost.PreAuthorize;
import com.luxesuite.api.repository.BranchRepository;
import com.luxesuite.api.model.Branch;

@RestController
@RequestMapping("/api/v1/settings")
public class BranchSettingsController {
    
    @Autowired
    private BranchSettingsRepository settingsRepository;
    @Autowired
    private StaffRepository staffRepository;
    @Autowired
    private BranchRepository branchRepository;

    @GetMapping("/branch")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> getBranchSettings(@AuthenticationPrincipal UserDetails userDetails, @RequestParam(required = false) Long branchId) {
        Staff staff = staffRepository.findByUserEmail(userDetails.getUsername()).orElseThrow();
        boolean isAdmin = staff.getUser().getRole().getName().equals("ADMIN");
        Long targetBranchId = (isAdmin && branchId != null) ? branchId : staff.getBranch().getId();
        
        return settingsRepository.findByBranchId(targetBranchId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/branch")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> updateBranchSettings(
            @AuthenticationPrincipal UserDetails userDetails, 
            @RequestParam(required = false) Long branchId,
            @RequestBody BranchSettings settings) {
            
        Staff staff = staffRepository.findByUserEmail(userDetails.getUsername()).orElseThrow();
        boolean isAdmin = staff.getUser().getRole().getName().equals("ADMIN");
        Long targetBranchId = (isAdmin && branchId != null) ? branchId : staff.getBranch().getId();
        
        BranchSettings existing = settingsRepository.findByBranchId(targetBranchId).orElse(new BranchSettings());
        
        if (existing.getBranch() == null) {
            Branch branch = branchRepository.findById(targetBranchId)
                    .orElseThrow(() -> new IllegalArgumentException("Branch not found"));
            existing.setBranch(branch);
        }
        
        existing.setBusinessName(settings.getBusinessName());
        existing.setEmail(settings.getEmail());
        existing.setPhone(settings.getPhone());
        existing.setCurrency(settings.getCurrency());
        existing.setTimeZone(settings.getTimeZone());
        existing.setMaintenanceMode(settings.isMaintenanceMode());
        return ResponseEntity.ok(settingsRepository.save(existing));
    }
}
