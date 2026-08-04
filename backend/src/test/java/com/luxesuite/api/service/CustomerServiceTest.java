package com.luxesuite.api.service;

import com.luxesuite.api.dto.CustomerDto;
import com.luxesuite.api.exception.ResourceNotFoundException;
import com.luxesuite.api.model.Customer;
import com.luxesuite.api.model.User;
import com.luxesuite.api.repository.CustomerRepository;
import com.luxesuite.api.security.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private SecurityUtils securityUtils;

    @InjectMocks
    private CustomerService customerService;

    private Customer testCustomer;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(100L);

        testCustomer = new Customer();
        testCustomer.setId(1L);
        testCustomer.setFirstName("John");
        testCustomer.setLastName("Doe");
        testCustomer.setEmail("john@example.com");
        testCustomer.setUser(testUser);
    }

    @Test
    void getCustomerById_Success() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(testCustomer));
        doNothing().when(securityUtils).validateCustomerOwnership(100L);

        CustomerDto result = customerService.getCustomerById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("John", result.getFirstName());
        assertEquals("Doe", result.getLastName());
        
        verify(customerRepository).findById(1L);
        verify(securityUtils).validateCustomerOwnership(100L);
    }

    @Test
    void getCustomerById_ThrowsNotFoundException() {
        when(customerRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            customerService.getCustomerById(999L);
        });

        verify(customerRepository).findById(999L);
        verify(securityUtils, never()).validateCustomerOwnership(any());
    }

    @Test
    void createCustomer_Success() {
        CustomerDto inputDto = new CustomerDto();
        inputDto.setFirstName("Jane");
        inputDto.setLastName("Smith");
        inputDto.setEmail("jane@example.com");

        Customer savedCustomer = new Customer();
        savedCustomer.setId(2L);
        savedCustomer.setFirstName("Jane");
        savedCustomer.setLastName("Smith");
        savedCustomer.setEmail("jane@example.com");

        when(customerRepository.save(any(Customer.class))).thenReturn(savedCustomer);

        CustomerDto result = customerService.createCustomer(inputDto);

        assertNotNull(result);
        assertEquals(2L, result.getId());
        assertEquals("Jane", result.getFirstName());
        assertEquals("jane@example.com", result.getEmail());
        
        verify(customerRepository).save(any(Customer.class));
    }
}
