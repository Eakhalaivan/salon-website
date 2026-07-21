package com.luxesuite.api.controller;

import com.luxesuite.api.model.User;
import com.luxesuite.api.model.Customer;
import com.luxesuite.api.repository.AppointmentRepository;
import com.luxesuite.api.repository.InvoiceRepository;
import com.luxesuite.api.repository.LoyaltyTransactionRepository;
import com.luxesuite.api.repository.UserRepository;
import com.luxesuite.api.repository.CustomerRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/customers/me/activity")
@RequiredArgsConstructor
public class ActivityController {

    private final AppointmentRepository appointmentRepository;
    private final InvoiceRepository invoiceRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;

    @GetMapping
    public ResponseEntity<List<ActivityDto>> getRecentActivity() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        Customer customer = customerRepository.findByUserId(user.getId()).orElse(null);
        if (customer == null) {
            return ResponseEntity.ok(List.of());
        }

        Long customerId = customer.getId();
        List<ActivityDto> activities = new ArrayList<>();

        // Add Appointments
        appointmentRepository.findByCustomerId(customerId).forEach(apt -> {
            String serviceName = apt.getServices().isEmpty() ? "Service" : apt.getServices().get(0).getService().getName();
            activities.add(ActivityDto.builder()
                    .title("Appointment Booked")
                    .description(serviceName)
                    .date(apt.getCreatedAt())
                    .icon("calendar_month")
                    .build());
        });

        // Add Invoices
        invoiceRepository.findByCustomerId(customerId).forEach(inv -> {
            activities.add(ActivityDto.builder()
                    .title("Invoice Generated")
                    .description("INV-" + inv.getId() + " - " + inv.getStatus())
                    .date(inv.getCreatedAt())
                    .icon("receipt_long")
                    .build());
        });

        // Add Points
        loyaltyTransactionRepository.findByCustomerId(customerId, PageRequest.of(0, 10)).forEach(pt -> {
            if (pt.getPointsDelta() > 0) {
                activities.add(ActivityDto.builder()
                        .title("Points Earned")
                        .description(pt.getReason() != null ? pt.getReason() : "Reward Points")
                        .date(pt.getCreatedAt())
                        .icon("stars")
                        .build());
            }
        });

        // Sort by date descending and take top 5
        List<ActivityDto> sortedActivities = activities.stream()
                .sorted(Comparator.comparing(ActivityDto::getDate).reversed())
                .limit(5)
                .collect(Collectors.toList());

        return ResponseEntity.ok(sortedActivities);
    }

    @GetMapping("/stats")
    public ResponseEntity<java.util.Map<String, Object>> getDashboardStats() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        Customer customer = customerRepository.findByUserId(user.getId()).orElse(null);
        if (customer == null) {
            return ResponseEntity.ok(java.util.Map.of("upcomingAppointments", 0));
        }

        long upcomingAppointments = appointmentRepository.findByCustomerId(customer.getId()).stream()
                .filter(a -> a.getStatus() == com.luxesuite.api.model.AppointmentStatus.BOOKED)
                .count();

        return ResponseEntity.ok(java.util.Map.of("upcomingAppointments", upcomingAppointments));
    }

    @Data
    @Builder
    public static class ActivityDto {
        private String title;
        private String description;
        private LocalDateTime date;
        private String icon;
    }
}
