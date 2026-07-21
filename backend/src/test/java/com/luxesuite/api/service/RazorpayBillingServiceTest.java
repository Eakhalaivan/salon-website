package com.luxesuite.api.service;

import com.luxesuite.api.model.*;
import com.luxesuite.api.repository.*;
import com.luxesuite.api.security.SecurityUtils;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RazorpayBillingServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;
    
    @Mock
    private SecurityUtils securityUtils;
    
    @Mock
    private RazorpayClient razorpayClient;
    
    @Mock
    private com.razorpay.OrderClient orderClient;

    @InjectMocks
    private BillingService billingService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(billingService, "razorpayWebhookSecret", "test_secret");
        ReflectionTestUtils.setField(billingService, "razorpayClient", razorpayClient);
    }

    @Test
    void testCreateRazorpayOrder_Success() throws Exception {
        Long invoiceId = 1L;
        Customer customer = new Customer();
        customer.setId(1L);

        Invoice invoice = new Invoice();
        invoice.setId(invoiceId);
        invoice.setCustomer(customer);
        invoice.setTotalAmount(new BigDecimal("100.00"));
        invoice.setPayments(new ArrayList<>());

        when(invoiceRepository.findById(invoiceId)).thenReturn(Optional.of(invoice));
        doNothing().when(securityUtils).validateCustomerOwnership(1L);

        Order mockOrder = mock(Order.class);
        when(mockOrder.get("id")).thenReturn("order_123");
        
        // Mock the nested orders client inside razorpayClient
        razorpayClient.orders = orderClient;
        when(orderClient.create(any(JSONObject.class))).thenReturn(mockOrder);

        String orderId = billingService.createRazorpayOrder(invoiceId);

        assertEquals("order_123", orderId);
        verify(invoiceRepository).findById(invoiceId);
        verify(securityUtils).validateCustomerOwnership(1L);
        verify(orderClient).create(any(JSONObject.class));
    }
}
