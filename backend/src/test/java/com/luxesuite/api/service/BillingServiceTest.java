package com.luxesuite.api.service;

import com.luxesuite.api.model.*;
import com.luxesuite.api.repository.AppointmentRepository;
import com.luxesuite.api.repository.InvoiceRepository;
import com.luxesuite.api.repository.InventoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BillingServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private com.luxesuite.api.repository.CustomerSubscriptionRepository customerSubscriptionRepository;

    @Mock
    private LoyaltyService loyaltyService;

    @Mock
    private com.luxesuite.api.security.SecurityUtils securityUtils;

    @Mock
    private ReferralService referralService;

    @Mock
    private PayrollService payrollService;

    @Mock
    private GiftCardService giftCardService;

    @Mock
    private WalletService walletService;

    @InjectMocks
    private BillingService billingService;

    private Appointment mockAppointment;
    private Invoice mockInvoice;

    @BeforeEach
    void setUp() {
        mockAppointment = new Appointment();
        mockAppointment.setId(1L);
        mockAppointment.setStatus(AppointmentStatus.COMPLETED);
        mockAppointment.setTotalPrice(new BigDecimal("100.00"));
        
        Customer customer = new Customer();
        customer.setId(1L);
        mockAppointment.setCustomer(customer);
        
        Branch branch = new Branch();
        branch.setId(1L);
        mockAppointment.setBranch(branch);
        
        mockAppointment.setServices(new ArrayList<>());
        
        mockInvoice = new Invoice();
        mockInvoice.setId(1L);
        mockInvoice.setCustomer(customer);
        mockInvoice.setTotalAmount(new BigDecimal("110.00")); // 100 + 10% tax
        mockInvoice.setPayments(new ArrayList<>());
    }

    @Test
    void testGenerateInvoiceFromAppointment_Success() {
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(mockAppointment));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> {
            Invoice saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });
        org.springframework.data.domain.Page<com.luxesuite.api.model.CustomerSubscription> emptyPage = org.springframework.data.domain.Page.empty();
        when(customerSubscriptionRepository.findByCustomerIdAndStatus(anyLong(), anyString(), any())).thenReturn(emptyPage);
        
        Invoice result = billingService.generateInvoiceFromAppointment(1L);

        assertNotNull(result);
        assertEquals(0, new BigDecimal("100.00").compareTo(result.getSubtotal()));
        assertEquals(0, new BigDecimal("10.00").compareTo(result.getTaxAmount())); // 10% tax
        assertEquals(0, new BigDecimal("110.00").compareTo(result.getTotalAmount()));
        
        verify(invoiceRepository, times(1)).save(any(Invoice.class));
    }

    @Test
    void testProcessPayment_Success() {
        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(mockInvoice));
        when(invoiceRepository.save(any(Invoice.class))).thenReturn(mockInvoice);
        doNothing().when(securityUtils).validateCustomerOwnership(anyLong());

        Payment payment = billingService.processPayment(1L, new BigDecimal("110.00"), "CASH", "txn_123");

        assertNotNull(payment);
        assertEquals("SUCCESS", payment.getStatus());
        assertEquals("PAID", mockInvoice.getStatus());
        
        verify(invoiceRepository, times(1)).save(mockInvoice);
        verify(loyaltyService, times(1)).awardPoints(any(Customer.class), any(Invoice.class));
    }
}
