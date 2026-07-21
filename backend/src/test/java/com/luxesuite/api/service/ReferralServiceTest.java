package com.luxesuite.api.service;

import com.luxesuite.api.model.Customer;
import com.luxesuite.api.model.Invoice;
import com.luxesuite.api.model.Referral;
import com.luxesuite.api.repository.CustomerRepository;
import com.luxesuite.api.repository.InvoiceRepository;
import com.luxesuite.api.repository.ReferralRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReferralServiceTest {

    @Mock
    private ReferralRepository referralRepository;

    @Mock
    private CustomerRepository customerRepository;
    
    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private WalletService walletService;

    @InjectMocks
    private ReferralService referralService;

    private Customer referrer;
    private Customer referred;
    private Referral referral;

    @BeforeEach
    void setUp() {
        referrer = Customer.builder().id(1L).referralCode("REF-1").build();
        referred = Customer.builder().id(2L).build();
        
        referral = Referral.builder()
                .id(100L)
                .referrer(referrer)
                .referred(referred)
                .code("REF-1")
                .status("PENDING")
                .rewardIssued(false)
                .build();
    }

    @Test
    void processReferral_onFirstPayment() {
        // Arrange
        when(referralRepository.findByReferredId(referred.getId()))
                .thenReturn(Optional.of(referral));
        
        when(invoiceRepository.countByCustomerIdAndStatus(referred.getId(), "PAID"))
                .thenReturn(1L);
                
        // Act
        referralService.checkAndIssueReward(referred.getId());

        // Assert
        assertEquals("COMPLETED", referral.getStatus());
        verify(referralRepository).save(referral);
        verify(walletService).credit(eq(referrer.getId()), any(), anyString());
    }

    @Test
    void processReferral_noPendingReferral() {
        // Arrange
        when(referralRepository.findByReferredId(referred.getId()))
                .thenReturn(Optional.empty());
                
        // Act
        referralService.checkAndIssueReward(referred.getId());

        // Assert
        verify(referralRepository, never()).save(any());
        verify(walletService, never()).credit(any(), any(), any());
    }
}
