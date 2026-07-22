package com.luxesuite.api.controller;

import com.luxesuite.api.dto.DashboardStatsDto;
import com.luxesuite.api.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import com.luxesuite.api.security.SecurityUtils;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final SecurityUtils securityUtils;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<DashboardStatsDto> getDashboardStats(@RequestParam(required = false) Long branchId) {
        if (branchId != null) {
            securityUtils.validateBranchAccess(branchId);
        } else {
            if (securityUtils.hasRole("MANAGER")) {
                branchId = securityUtils.getStaffBranchId();
            } else if (!securityUtils.hasRole("ADMIN")) {
                throw new com.luxesuite.api.exception.ForbiddenException("Unauthorized: Managers must specify a branchId or have one assigned");
            }
        }
        return ResponseEntity.ok(analyticsService.getDashboardStats(branchId));
    }
}
