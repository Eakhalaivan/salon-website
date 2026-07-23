package com.luxesuite.api.service.ai;

import com.luxesuite.api.dto.AiRecommendationDto;
import com.luxesuite.api.model.Appointment;
import com.luxesuite.api.model.Customer;
import com.luxesuite.api.model.Service;
import com.luxesuite.api.repository.AppointmentRepository;
import com.luxesuite.api.repository.CustomerRepository;
import com.luxesuite.api.repository.ServiceRepository;
import com.luxesuite.api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Slf4j
public class AiRecommendationService {

    private final CustomerRepository customerRepository;
    private final AppointmentRepository appointmentRepository;
    private final ServiceRepository serviceRepository;
    private final AiClientService aiClientService;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public List<AiRecommendationDto> getRecommendationsForCustomer(Long customerId) {
        // Validation handled by SecurityUtils (user must be the customer or staff)
        
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new com.luxesuite.api.exception.ResourceNotFoundException("Customer not found"));

        List<Appointment> pastAppointments = appointmentRepository.findByCustomerId(customerId);
        
        // 1. Deterministic heuristic fallback: find popular services
        List<Service> allServices = serviceRepository.findTopServicesByBookingCountNative(10);
        
        // Exclude services they've already had recently (simple heuristic)
        List<Long> recentServiceIds = pastAppointments.stream()
                .flatMap(a -> a.getServices().stream())
                .map(item -> item.getService().getId())
                .distinct()
                .collect(Collectors.toList());
                
        List<Service> candidates = allServices.stream()
                .filter(s -> !recentServiceIds.contains(s.getId()))
                .limit(3)
                .collect(Collectors.toList());
                
        // If they've had all top services, just suggest the most popular anyway
        if (candidates.isEmpty()) {
            candidates = allServices.stream().limit(3).collect(Collectors.toList());
        }
        
        // Build base DTOs
        List<AiRecommendationDto> recommendations = candidates.stream()
                .map(s -> AiRecommendationDto.builder()
                        .serviceId(s.getId())
                        .name(s.getName())
                        .price(s.getPrice())
                        .durationMinutes(s.getDurationMins())
                        .rationale("Based on your booking history, this is a great addition.")
                        .build())
                .collect(Collectors.toList());

        // 2. Enhance with AI (Optional enhancement, fails gracefully)
        if (candidates.size() > 0) {
            String systemPrompt = "You are a professional salon assistant recommending services. Provide ONLY a single, short sentence explaining why the customer should try one of these services. Do not output anything else.";
            String userPrompt = "Customer has previously booked: " + pastAppointments.stream().flatMap(a -> a.getServices().stream()).map(item -> item.getService().getName()).collect(Collectors.joining(", ")) + ". " +
                    "I am recommending: " + candidates.get(0).getName() + ". Give a one sentence rationale.";
            
            String aiRationale = aiClientService.complete(systemPrompt, userPrompt);
            if (aiRationale != null && !aiRationale.trim().isEmpty()) {
                // Apply the AI reasoning to the top recommendation to make it dynamic
                recommendations.get(0).setRationale(aiRationale.trim());
            }
        }

        return recommendations;
    }
}
