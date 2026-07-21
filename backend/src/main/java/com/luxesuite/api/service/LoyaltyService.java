package com.luxesuite.api.service;

import com.luxesuite.api.dto.LoyaltyDto;
import com.luxesuite.api.dto.LoyaltyTransactionDto;
import com.luxesuite.api.dto.PageResponse;
import com.luxesuite.api.exception.ForbiddenException;
import com.luxesuite.api.exception.ResourceNotFoundException;
import com.luxesuite.api.model.Customer;
import com.luxesuite.api.model.Invoice;
import com.luxesuite.api.model.LoyaltyPoints;
import com.luxesuite.api.model.LoyaltyTransaction;
import com.luxesuite.api.repository.CustomerRepository;
import com.luxesuite.api.repository.LoyaltyPointsRepository;
import com.luxesuite.api.repository.LoyaltyTransactionRepository;
import com.luxesuite.api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoyaltyService {

    private final LoyaltyPointsRepository loyaltyPointsRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final CustomerRepository customerRepository;
    private final SecurityUtils securityUtils;

    @Value("${app.loyalty.points-per-100:1}")
    private int pointsPer100;

    @Transactional
    public void awardPoints(Customer customer, Invoice invoice) {
        if (customer == null || invoice == null) return;

        // Prevent duplicate awards for the same invoice
        if (loyaltyTransactionRepository.existsByRelatedInvoiceId(invoice.getId())) {
            log.info("Points already awarded for invoice {}", invoice.getId());
            return;
        }

        BigDecimal total = invoice.getTotalAmount();
        if (total == null || total.compareTo(BigDecimal.ZERO) <= 0) return;

        // Calculate points: e.g., total=250.00 -> 250 / 100 * pointsPer100 = 2 * pointsPer100
        int earnedPoints = total.divideToIntegralValue(new BigDecimal("100")).intValue() * pointsPer100;
        
        if (earnedPoints > 0) {
            LoyaltyPoints loyalty = loyaltyPointsRepository.findByCustomerId(customer.getId())
                    .orElseGet(() -> LoyaltyPoints.builder()
                            .customer(customer)
                            .pointsBalance(0)
                            .build());

            loyalty.setPointsBalance(loyalty.getPointsBalance() + earnedPoints);
            loyaltyPointsRepository.save(loyalty);

            LoyaltyTransaction transaction = LoyaltyTransaction.builder()
                    .customer(customer)
                    .pointsDelta(earnedPoints)
                    .reason("Points earned from invoice #" + invoice.getId())
                    .relatedInvoice(invoice)
                    .build();
            loyaltyTransactionRepository.save(transaction);
            
            log.info("Awarded {} points to customer {} for invoice {}", earnedPoints, customer.getId(), invoice.getId());
        }
    }

    @Transactional(readOnly = true)
    public LoyaltyDto getMyLoyalty(int page, int size) {
        Long customerId = securityUtils.getCurrentUserId();
        // Since we map users 1:1, we need the customer ID
        Customer customer = customerRepository.findByEmail(securityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return getCustomerLoyaltyInternal(customer.getId(), page, size);
    }

    @Transactional(readOnly = true)
    public LoyaltyDto getCustomerLoyalty(Long customerId, int page, int size) {
        return getCustomerLoyaltyInternal(customerId, page, size);
    }

    private LoyaltyDto getCustomerLoyaltyInternal(Long customerId, int page, int size) {
        LoyaltyPoints loyalty = loyaltyPointsRepository.findByCustomerId(customerId)
                .orElseGet(() -> {
                    LoyaltyPoints empty = new LoyaltyPoints();
                    empty.setPointsBalance(0);
                    return empty;
                });

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<LoyaltyTransaction> transactionPage = loyaltyTransactionRepository.findByCustomerId(customerId, pageable);

        PageResponse<LoyaltyTransactionDto> txResponse = new PageResponse<>(
                transactionPage.getContent().stream().map(this::mapToTransactionDto).collect(Collectors.toList()),
                transactionPage.getNumber(),
                transactionPage.getSize(),
                transactionPage.getTotalElements(),
                transactionPage.getTotalPages(),
                transactionPage.isLast()
        );

        return LoyaltyDto.builder()
                .id(loyalty.getId())
                .customerId(customerId)
                .pointsBalance(loyalty.getPointsBalance())
                .transactions(txResponse)
                .updatedAt(loyalty.getUpdatedAt())
                .build();
    }

    private LoyaltyTransactionDto mapToTransactionDto(LoyaltyTransaction tx) {
        return LoyaltyTransactionDto.builder()
                .id(tx.getId())
                .pointsDelta(tx.getPointsDelta())
                .reason(tx.getReason())
                .relatedInvoiceId(tx.getRelatedInvoice() != null ? tx.getRelatedInvoice().getId() : null)
                .createdAt(tx.getCreatedAt())
                .build();
    }
}
