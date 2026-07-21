package com.luxesuite.api.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class PaymentControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    /**
     * Fix #1 — CUSTOMER role must NOT be able to POST to the manual payment endpoint.
     * The endpoint is now restricted to ADMIN, MANAGER, RECEPTIONIST only.
     */
    @Test
    @WithMockUser(roles = "CUSTOMER")
    public void givenCustomerRole_whenProcessManualPayment_thenForbidden() throws Exception {
        String payload = """
                {
                    "amount": 100.0,
                    "paymentMethod": "CASH",
                    "transactionRef": "REF123"
                }
                """;

        mockMvc.perform(post("/api/v1/payments/invoice/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isForbidden());
    }
}
