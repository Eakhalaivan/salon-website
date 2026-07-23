package com.luxesuite.api.service;

import com.luxesuite.api.dto.CustomerSubscriptionDto;
import com.luxesuite.api.dto.SubscriptionPlanDto;
import com.luxesuite.api.model.Customer;
import com.luxesuite.api.model.CustomerSubscription;
import com.luxesuite.api.model.SubscriptionPlan;
import com.luxesuite.api.model.User;
import com.luxesuite.api.repository.CustomerRepository;
import com.luxesuite.api.repository.CustomerSubscriptionRepository;
import com.luxesuite.api.repository.SubscriptionPlanRepository;
import com.luxesuite.api.security.CustomUserDetails;
import com.luxesuite.api.exception.ResourceNotFoundException;
import com.luxesuite.api.exception.ForbiddenException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionPlanRepository planRepository;
    private final CustomerSubscriptionRepository customerSubscriptionRepository;
    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    @org.springframework.cache.annotation.Cacheable(value = "subscription_plans", key = "'active_' + #page + '_' + #size + '_' + #businessType")
    public com.luxesuite.api.dto.PageResponse<SubscriptionPlanDto> getActivePlans(int page, int size, String businessType) {
        String bType = businessType != null ? businessType : "BOTH";
        List<String> validTypes = "BOTH".equals(bType) ? java.util.Arrays.asList("SPA", "SALON", "BOTH") : java.util.Arrays.asList("BOTH", bType);
        org.springframework.data.domain.Page<SubscriptionPlan> plans = planRepository.findByIsActiveTrueAndBusinessTypeIn(validTypes, org.springframework.data.domain.PageRequest.of(page, size));
        return com.luxesuite.api.dto.PageResponse.of(plans.map(this::mapToPlanDto));
    }

    @Transactional(readOnly = true)
    public com.luxesuite.api.dto.PageResponse<CustomerSubscriptionDto> getMySubscriptions(int page, int size) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof com.luxesuite.api.security.CustomUserDetails) {
            com.luxesuite.api.security.CustomUserDetails userDetails = (com.luxesuite.api.security.CustomUserDetails) auth.getPrincipal();
            User currentUser = userDetails.getUser();
            
            Customer customer = customerRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found for current user"));

            org.springframework.data.domain.Page<CustomerSubscription> subs = customerSubscriptionRepository.findByCustomerIdAndStatus(customer.getId(), "ACTIVE", org.springframework.data.domain.PageRequest.of(page, size));
            return com.luxesuite.api.dto.PageResponse.of(subs.map(this::mapToSubscriptionDto));
        }
        throw new ForbiddenException("Unauthorized");
    }

    @Transactional
    public CustomerSubscriptionDto activateSubscription(Long planId, Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (customerSubscriptionRepository.existsByCustomerIdAndStatus(customer.getId(), "ACTIVE")) {
            throw new IllegalStateException("You already have an active membership plan. Please wait for it to expire or cancel it before purchasing a new one.");
        }

        SubscriptionPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

        if (!plan.getIsActive()) {
            throw new IllegalArgumentException("Cannot purchase inactive plan");
        }

        CustomerSubscription subscription = new CustomerSubscription();
        subscription.setCustomer(customer);
        subscription.setPlan(plan);
        subscription.setStartDate(java.time.LocalDateTime.now());
        subscription.setEndDate(java.time.LocalDateTime.now().plusDays(plan.getValidityDays()));
        
        if ("WALLET".equals(plan.getPlanType())) {
            subscription.setRemainingBalance(plan.getPrice()); // Assuming price equals wallet balance
        } else {
            subscription.setRemainingBalance(java.math.BigDecimal.valueOf(plan.getTotalSessions() != null ? plan.getTotalSessions() : 0));
        }
        
        subscription.setStatus("ACTIVE");
        
        CustomerSubscription savedSub = customerSubscriptionRepository.save(subscription);
        return mapToSubscriptionDto(savedSub);
    }

    private SubscriptionPlanDto mapToPlanDto(SubscriptionPlan plan) {
        SubscriptionPlanDto dto = new SubscriptionPlanDto();
        dto.setId(plan.getId());
        dto.setName(plan.getName());
        dto.setDescription(plan.getDescription());
        dto.setValidityDays(plan.getValidityDays());
        dto.setPrice(plan.getPrice());
        dto.setDiscountRate(plan.getDiscountRate());
        dto.setPlanType(plan.getPlanType());
        dto.setTotalSessions(plan.getTotalSessions());
        dto.setBusinessType(plan.getBusinessType());
        return dto;
    }

    private CustomerSubscriptionDto mapToSubscriptionDto(CustomerSubscription sub) {
        CustomerSubscriptionDto dto = new CustomerSubscriptionDto();
        dto.setId(sub.getId());
        dto.setCustomerId(sub.getCustomer().getId());
        dto.setPlan(mapToPlanDto(sub.getPlan()));
        dto.setStartDate(sub.getStartDate());
        dto.setEndDate(sub.getEndDate());
        dto.setRemainingBalance(sub.getRemainingBalance());
        dto.setStatus(sub.getStatus());
        return dto;
    }
}
