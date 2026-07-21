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

@RestController
@RequestMapping("/api/v1/settings")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BranchSettingsController {
    
    @Autowired
    private BranchSettingsRepository settingsRepository;
    @Autowired
    private StaffRepository staffRepository;

    @GetMapping("/branch")
    public ResponseEntity<?> getBranchSettings(@AuthenticationPrincipal UserDetails userDetails) {
        Staff staff = staffRepository.findByUserEmail(userDetails.getUsername()).orElseThrow();
        return settingsRepository.findByBranchId(staff.getBranch().getId())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/branch")
    public ResponseEntity<?> updateBranchSettings(@AuthenticationPrincipal UserDetails userDetails, @RequestBody BranchSettings settings) {
        Staff staff = staffRepository.findByUserEmail(userDetails.getUsername()).orElseThrow();
        BranchSettings existing = settingsRepository.findByBranchId(staff.getBranch().getId()).orElse(new BranchSettings());
        existing.setBranch(staff.getBranch());
        existing.setBusinessName(settings.getBusinessName());
        existing.setEmail(settings.getEmail());
        existing.setPhone(settings.getPhone());
        existing.setCurrency(settings.getCurrency());
        existing.setTimeZone(settings.getTimeZone());
        existing.setMaintenanceMode(settings.isMaintenanceMode());
        return ResponseEntity.ok(settingsRepository.save(existing));
    }
}
