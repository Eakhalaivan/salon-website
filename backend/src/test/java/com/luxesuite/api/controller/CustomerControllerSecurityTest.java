package com.luxesuite.api.controller;

import com.luxesuite.api.model.User;
import com.luxesuite.api.security.CustomUserDetails;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.luxesuite.api.exception.ForbiddenException;
import com.luxesuite.api.service.CustomerService;
import com.luxesuite.api.security.SecurityUtils;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class CustomerControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CustomerService customerService;

    /**
     * Fix #8 — A CUSTOMER authenticating as user ID 1 should not be able to fetch
     * another customer's record (user ID 2). The service throws ForbiddenException
     * when validateCustomerOwnership detects a mismatch; this test asserts the
     * controller propagates that as a 403.
     */
    @Test
    @WithMockUser(username = "customer@luxesuite.com", roles = "CUSTOMER")
    public void givenCustomerRole_whenGetDifferentCustomer_thenForbidden() throws Exception {
        when(customerService.getCustomerById(anyLong()))
                .thenThrow(new ForbiddenException("Unauthorized: You can only access your own data."));

        mockMvc.perform(get("/api/v1/customers/99"))
                .andExpect(status().isForbidden());
    }

    /**
     * Fix #8 — A CUSTOMER should not be able to update another customer's profile
     * via PUT /api/v1/customers/{id} where {id} belongs to a different user.
     */
    @Test
    @WithMockUser(username = "customer@luxesuite.com", roles = "CUSTOMER")
    public void givenCustomerRole_whenUpdateDifferentCustomer_thenForbidden() throws Exception {
        when(customerService.updateCustomer(anyLong(), any()))
                .thenThrow(new ForbiddenException("Unauthorized: You can only access your own data."));

        String payload = """
                {
                    "firstName": "Hacker",
                    "lastName": "User",
                    "email": "hacker@evil.com",
                    "phone": "0000000000"
                }
                """;

        mockMvc.perform(put("/api/v1/customers/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isForbidden());
    }
}
