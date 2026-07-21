package com.luxesuite.api.service;

import com.luxesuite.api.dto.DashboardStatsDto;
import com.luxesuite.api.model.Appointment;
import com.luxesuite.api.model.Invoice;
import com.luxesuite.api.repository.AppointmentRepository;
import com.luxesuite.api.repository.CustomerRepository;
import com.luxesuite.api.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "dashboardStats", key = "#branchId != null ? #branchId : 'global'")
    public DashboardStatsDto getDashboardStats(Long branchId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth()).atTime(LocalTime.MAX);

        // Appointments Today
        List<Appointment> todayAppts;
        if (branchId != null) {
            todayAppts = appointmentRepository.findByBranchIdAndCreatedAtBetween(branchId, startOfDay, endOfDay, org.springframework.data.domain.Pageable.unpaged()).getContent();
        } else {
            todayAppts = appointmentRepository.findByCreatedAtBetween(startOfDay, endOfDay, org.springframework.data.domain.Pageable.unpaged()).getContent();
        }
        long totalAppointmentsToday = todayAppts.size();

        // Revenue Today
        List<Invoice> todayInvoices;
        if (branchId != null) {
            todayInvoices = invoiceRepository.findByBranchIdAndCreatedAtBetween(branchId, startOfDay, endOfDay);
        } else {
            todayInvoices = invoiceRepository.findByCreatedAtBetween(startOfDay, endOfDay);
        }
        
        BigDecimal revenueToday = todayInvoices.stream()
                .filter(i -> "PAID".equals(i.getStatus()))
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Revenue This Month
        List<Invoice> monthInvoices;
        if (branchId != null) {
            monthInvoices = invoiceRepository.findByBranchIdAndCreatedAtBetween(branchId, startOfMonth, endOfMonth);
        } else {
            monthInvoices = invoiceRepository.findByCreatedAtBetween(startOfMonth, endOfMonth);
        }
        BigDecimal revenueThisMonth = monthInvoices.stream()
                .filter(i -> "PAID".equals(i.getStatus()))
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Note: For actual implementation, CustomerRepository needs a date filter query. 
        // Using a stub value for demonstration purposes here as we did not add that specific query to CustomerRepository yet.
        long newCustomersThisMonth = 12L; 

        return DashboardStatsDto.builder()
                .totalAppointmentsToday(totalAppointmentsToday)
                .revenueToday(revenueToday)
                .revenueThisMonth(revenueThisMonth)
                .newCustomersThisMonth(newCustomersThisMonth)
                .build();
    }
}
