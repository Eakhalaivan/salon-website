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
import com.luxesuite.api.exception.ResourceNotFoundException;
import com.luxesuite.api.exception.ConflictException;

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
        boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        Long targetBranchId;
        
        if (isAdmin) {
            targetBranchId = branchId != null ? branchId : 1L;
        } else {
            Staff staff = staffRepository.findByUserEmail(userDetails.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("No staff profile is linked to this account (" + userDetails.getUsername() + "). Contact an administrator to complete setup."));
            if (staff.getBranch() == null) {
                throw new ConflictException("Your staff profile isn't assigned to a branch yet. Contact an administrator to assign one.");
            }
            targetBranchId = staff.getBranch().getId();
        }
        
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
            
        boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        Long targetBranchId;
        
        if (isAdmin) {
            targetBranchId = branchId != null ? branchId : 1L;
        } else {
            Staff staff = staffRepository.findByUserEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Staff profile not found"));
            if (staff.getBranch() == null) {
                throw new RuntimeException("Staff has no branch assigned");
            }
            targetBranchId = staff.getBranch().getId();
        }
        
        BranchSettings existing = settingsRepository.findByBranchId(targetBranchId).orElse(new BranchSettings());
        
        if (existing.getBranch() == null) {
            Branch branch = branchRepository.findById(targetBranchId)
                    .orElseThrow(() -> new ResourceNotFoundException("Branch not found: " + targetBranchId));
            existing.setBranch(branch);
        }
        
        existing.setBusinessName(settings.getBusinessName());
        existing.setEmail(settings.getEmail());
        existing.setPhone(settings.getPhone());
        existing.setCurrency(settings.getCurrency());
        existing.setTimeZone(settings.getTimeZone());
        existing.setMaintenanceMode(settings.isMaintenanceMode());
        
        // Integrations & Branding
        existing.setStripePublicKey(settings.getStripePublicKey());
        existing.setStripeSecretKey(settings.getStripeSecretKey());
        existing.setRazorpayKeyId(settings.getRazorpayKeyId());
        existing.setRazorpayKeySecret(settings.getRazorpayKeySecret());
        existing.setWhatsappApiKey(settings.getWhatsappApiKey());
        existing.setWhatsappPhoneNumberId(settings.getWhatsappPhoneNumberId());
        existing.setBrandLogoUrl(settings.getBrandLogoUrl());
        existing.setPrimaryColor(settings.getPrimaryColor());
        
        return ResponseEntity.ok(settingsRepository.save(existing));
    }
}
