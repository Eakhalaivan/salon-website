package com.luxesuite.api.service;

import com.luxesuite.api.dto.PageResponse;
import com.luxesuite.api.dto.PayrollRecordDto;
import com.luxesuite.api.dto.StaffCommissionRuleDto;
import com.luxesuite.api.model.*;
import com.luxesuite.api.repository.*;
import com.luxesuite.api.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRecordRepository payrollRecordRepository;
    private final CommissionEarningRepository commissionEarningRepository;
    private final StaffCommissionRuleRepository staffCommissionRuleRepository;
    private final StaffRepository staffRepository;
    private final ServiceRepository serviceRepository;

    @Transactional
    public void calculateCommissions(Invoice invoice) {
        if (invoice.getAppointment() == null) return;

        for (AppointmentItem item : invoice.getAppointment().getServices()) {
            Staff staff = item.getStaff();
            com.luxesuite.api.model.Service service = item.getService();
            
            // Find rule (specific service match first, then fallback to null/all-services)
            List<StaffCommissionRule> rules = staffCommissionRuleRepository.findByStaffId(staff.getId(), PageRequest.of(0, 100)).getContent();
            
            StaffCommissionRule appliedRule = rules.stream()
                    .filter(r -> r.getService() != null && r.getService().getId().equals(service.getId()))
                    .findFirst()
                    .orElseGet(() -> rules.stream()
                            .filter(r -> r.getService() == null)
                            .findFirst()
                            .orElse(null));

            BigDecimal commissionAmount = BigDecimal.ZERO;
            if (appliedRule != null) {
                if ("PERCENTAGE".equals(appliedRule.getCommissionType())) {
                    commissionAmount = item.getPrice().multiply(appliedRule.getCommissionValue()).divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP);
                } else if ("FIXED".equals(appliedRule.getCommissionType())) {
                    commissionAmount = appliedRule.getCommissionValue();
                }
            } else if (staff.getCommissionRate() != null) {
                // Fallback to legacy Staff commissionRate if exists
                commissionAmount = item.getPrice().multiply(staff.getCommissionRate()).divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP);
            }

            if (commissionAmount.compareTo(BigDecimal.ZERO) > 0) {
                CommissionEarning earning = CommissionEarning.builder()
                        .staff(staff)
                        .appointment(invoice.getAppointment())
                        .invoice(invoice)
                        .amount(commissionAmount)
                        .build();
                commissionEarningRepository.save(earning);
            }
        }
    }

    @Transactional
    public PayrollRecordDto generatePayroll(Long staffId, LocalDateTime start, LocalDateTime end) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        List<CommissionEarning> earnings = commissionEarningRepository.findByStaffIdAndDateRange(staffId, start, end);
        
        BigDecimal totalCommission = earnings.stream()
                .map(CommissionEarning::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        int totalAppointments = (int) earnings.stream()
                .map(e -> e.getAppointment().getId())
                .distinct()
                .count();

        // Calculate prorated base salary if needed. For now, assuming base salary is per period generated
        BigDecimal baseSalary = staff.getBaseSalary() != null ? staff.getBaseSalary() : BigDecimal.ZERO;
        
        BigDecimal grossPay = baseSalary.add(totalCommission);
        
        // Note: Tax deductions out of scope for this phase.

        PayrollRecord record = PayrollRecord.builder()
                .staff(staff)
                .periodStart(start)
                .periodEnd(end)
                .baseSalary(baseSalary)
                .commissionEarned(totalCommission)
                .totalAppointmentsCompleted(totalAppointments)
                .grossPay(grossPay)
                .status("DRAFT")
                .build();
                
        PayrollRecord saved = payrollRecordRepository.save(record);
        return mapToDto(saved);
    }

    public PageResponse<PayrollRecordDto> getStaffPayroll(Long staffId, int page, int size) {
        Page<PayrollRecord> records = payrollRecordRepository.findByStaffId(staffId, PageRequest.of(page, size));
        return PageResponse.of(records.map(this::mapToDto));
    }
    
    @Transactional
    public StaffCommissionRuleDto createCommissionRule(StaffCommissionRuleDto dto) {
        Staff staff = staffRepository.findById(dto.getStaffId())
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
                
        com.luxesuite.api.model.Service service = null;
        if (dto.getServiceId() != null) {
            service = serviceRepository.findById(dto.getServiceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        }
        
        StaffCommissionRule rule = StaffCommissionRule.builder()
                .staff(staff)
                .service(service)
                .commissionType(dto.getCommissionType())
                .commissionValue(dto.getCommissionValue())
                .build();
                
        return mapToRuleDto(staffCommissionRuleRepository.save(rule));
    }
    
    public PageResponse<StaffCommissionRuleDto> getCommissionRules(Long staffId, int page, int size) {
        Page<StaffCommissionRule> rules = staffCommissionRuleRepository.findByStaffId(staffId, PageRequest.of(page, size));
        return PageResponse.of(rules.map(this::mapToRuleDto));
    }

    private PayrollRecordDto mapToDto(PayrollRecord record) {
        PayrollRecordDto dto = new PayrollRecordDto();
        dto.setId(record.getId());
        dto.setStaffId(record.getStaff().getId());
        dto.setPeriodStart(record.getPeriodStart());
        dto.setPeriodEnd(record.getPeriodEnd());
        dto.setBaseSalary(record.getBaseSalary());
        dto.setCommissionEarned(record.getCommissionEarned());
        dto.setTotalAppointmentsCompleted(record.getTotalAppointmentsCompleted());
        dto.setGrossPay(record.getGrossPay());
        dto.setStatus(record.getStatus());
        dto.setGeneratedAt(record.getGeneratedAt());
        return dto;
    }
    
    private StaffCommissionRuleDto mapToRuleDto(StaffCommissionRule rule) {
        StaffCommissionRuleDto dto = new StaffCommissionRuleDto();
        dto.setId(rule.getId());
        dto.setStaffId(rule.getStaff().getId());
        dto.setServiceId(rule.getService() != null ? rule.getService().getId() : null);
        dto.setCommissionType(rule.getCommissionType());
        dto.setCommissionValue(rule.getCommissionValue());
        return dto;
    }
}
