package com.luxesuite.api.service;

import com.luxesuite.api.model.Customer;
import com.luxesuite.api.model.Invoice;
import com.luxesuite.api.model.LoyaltyPoints;
import com.luxesuite.api.model.LoyaltyTransaction;
import com.luxesuite.api.repository.LoyaltyPointsRepository;
import com.luxesuite.api.repository.LoyaltyTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class LoyaltyServiceTest {

    @Mock
    private LoyaltyPointsRepository loyaltyPointsRepository;

    @Mock
    private LoyaltyTransactionRepository loyaltyTransactionRepository;

    @InjectMocks
    private LoyaltyService loyaltyService;

    private Customer mockCustomer;
    private LoyaltyPoints mockLoyaltyPoints;

    @BeforeEach
    void setUp() {
        mockCustomer = new Customer();
        mockCustomer.setId(1L);

        mockLoyaltyPoints = new LoyaltyPoints();
        mockLoyaltyPoints.setId(1L);
        mockLoyaltyPoints.setCustomer(mockCustomer);
        mockLoyaltyPoints.setPointsBalance(50);
        
        // Use reflection to set the private configuration field for testing
        org.springframework.test.util.ReflectionTestUtils.setField(loyaltyService, "pointsPer100", 10);
    }



    @Test
    void testAwardPoints() {
        when(loyaltyPointsRepository.findByCustomerId(1L)).thenReturn(Optional.of(mockLoyaltyPoints));
        when(loyaltyPointsRepository.save(any(LoyaltyPoints.class))).thenReturn(mockLoyaltyPoints);
        when(loyaltyTransactionRepository.save(any(LoyaltyTransaction.class))).thenAnswer(i -> i.getArgument(0));

        Invoice mockInvoice = new Invoice();
        mockInvoice.setId(123L);
        mockInvoice.setTotalAmount(new BigDecimal("250.00"));
        
        loyaltyService.awardPoints(mockCustomer, mockInvoice);

        // 250 / 100 * 10 = 20 points
        assertEquals(70, mockLoyaltyPoints.getPointsBalance());
        verify(loyaltyPointsRepository, times(1)).save(mockLoyaltyPoints);
        verify(loyaltyTransactionRepository, times(1)).save(any(LoyaltyTransaction.class));
    }
}
