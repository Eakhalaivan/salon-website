package com.luxesuite.api.controller;

import com.luxesuite.api.dto.PageResponse;
import com.luxesuite.api.dto.PayrollGenerateRequest;
import com.luxesuite.api.dto.PayrollRecordDto;
import com.luxesuite.api.dto.StaffCommissionRuleDto;
import com.luxesuite.api.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payroll")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PayrollRecordDto> generatePayroll(@RequestBody PayrollGenerateRequest request) {
        return ResponseEntity.ok(payrollService.generatePayroll(request.getStaffId(), request.getPeriodStart(), request.getPeriodEnd()));
    }

    @GetMapping("/staff/{staffId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or @securityUtils.isCurrentStaff(#staffId)")
    public ResponseEntity<PageResponse<PayrollRecordDto>> getStaffPayroll(
            @PathVariable Long staffId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(payrollService.getStaffPayroll(staffId, page, size));
    }

    @PostMapping("/rules")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<StaffCommissionRuleDto> createRule(@RequestBody StaffCommissionRuleDto request) {
        return ResponseEntity.ok(payrollService.createCommissionRule(request));
    }

    @GetMapping("/staff/{staffId}/rules")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or @securityUtils.isCurrentStaff(#staffId)")
    public ResponseEntity<PageResponse<StaffCommissionRuleDto>> getStaffRules(
            @PathVariable Long staffId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(payrollService.getCommissionRules(staffId, page, size));
    }
}
