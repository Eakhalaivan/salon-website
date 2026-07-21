package com.luxesuite.api.service;

import com.luxesuite.api.dto.PageResponse;
import com.luxesuite.api.dto.ReferralDto;
import com.luxesuite.api.model.Customer;
import com.luxesuite.api.model.Invoice;
import com.luxesuite.api.model.Referral;
import com.luxesuite.api.repository.CustomerRepository;
import com.luxesuite.api.repository.InvoiceRepository;
import com.luxesuite.api.repository.ReferralRepository;
import com.luxesuite.api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReferralService {

    private final ReferralRepository referralRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;
    private final WalletService walletService;
    private final SecurityUtils securityUtils;

    @Value("${app.referral.reward.amount:10.00}")
    private BigDecimal rewardAmount;

    @Transactional
    public void processReferral(String referralCode, Customer referredCustomer) {
        if (referralCode == null || referralCode.trim().isEmpty()) {
            return;
        }

        Optional<Customer> referrerOpt = customerRepository.findByReferralCode(referralCode); // Needs repo method
        if (referrerOpt.isEmpty()) {
            return; // Ignore invalid code silently
        }
        
        Customer referrer = referrerOpt.get();
        if (referrer.getId().equals(referredCustomer.getId())) {
            return; // Can't refer self
        }

        Referral referral = Referral.builder()
                .referrer(referrer)
                .referred(referredCustomer)
                .code(referralCode)
                .status("PENDING")
                .rewardIssued(false)
                .build();
                
        referralRepository.save(referral);
    }

    @Transactional
    public void checkAndIssueReward(Long customerId) {
        Optional<Referral> referralOpt = referralRepository.findByReferredId(customerId);
        if (referralOpt.isEmpty()) {
            return;
        }

        Referral referral = referralOpt.get();
        if ("COMPLETED".equals(referral.getStatus()) || referral.getRewardIssued()) {
            return;
        }

        // Check if this was the customer's first completed invoice
        long completedInvoices = invoiceRepository.countByCustomerIdAndStatus(customerId, "PAID");
        if (completedInvoices == 1) { // Current one is the first
            referral.setStatus("COMPLETED");
            referral.setRewardIssued(true);
            referral.setCompletedAt(LocalDateTime.now());
            referralRepository.save(referral);
            
            walletService.credit(referral.getReferrer().getId(), rewardAmount, "Referral Reward for " + referral.getReferred().getFirstName());
        }
    }

    public String getMyReferralCode() {
        Long userId = securityUtils.getCurrentUserId();
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new com.luxesuite.api.exception.ResourceNotFoundException("Customer profile not found"));
        
        if (customer.getReferralCode() == null) {
            String code = generateUniqueReferralCode(customer.getFirstName(), customer.getLastName());
            customer.setReferralCode(code);
            customerRepository.save(customer);
            return code;
        }
        
        return customer.getReferralCode();
    }
    
    private String generateUniqueReferralCode(String firstName, String lastName) {
        String base = (firstName.substring(0, Math.min(firstName.length(), 3)) + 
                       (lastName != null && !lastName.isEmpty() ? lastName.substring(0, Math.min(lastName.length(), 2)) : ""))
                       .toUpperCase();
        
        while (true) {
            String code = base + (int)(Math.random() * 9000 + 1000);
            if (!customerRepository.existsByReferralCode(code)) {
                return code;
            }
        }
    }

    public PageResponse<ReferralDto> getMyReferrals(int page, int size) {
        Long userId = securityUtils.getCurrentUserId();
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new com.luxesuite.api.exception.ResourceNotFoundException("Customer profile not found"));
        Page<Referral> referrals = referralRepository.findByReferrerId(customer.getId(), PageRequest.of(page, size));
        return PageResponse.of(referrals.map(this::mapToDto));
    }

    private ReferralDto mapToDto(Referral referral) {
        ReferralDto dto = new ReferralDto();
        dto.setId(referral.getId());
        dto.setReferrerCustomerId(referral.getReferrer().getId());
        dto.setReferredCustomerId(referral.getReferred().getId());
        dto.setCode(referral.getCode());
        dto.setStatus(referral.getStatus());
        dto.setRewardIssued(referral.getRewardIssued());
        dto.setCreatedAt(referral.getCreatedAt());
        dto.setCompletedAt(referral.getCompletedAt());
        return dto;
    }
}
