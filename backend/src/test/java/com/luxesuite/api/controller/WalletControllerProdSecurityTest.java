package com.luxesuite.api.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("prod")
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:proddb;DB_CLOSE_DELAY=-1;MODE=MySQL",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.flyway.enabled=false",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "razorpay.key.secret=prod_mock_secret",
    "razorpay.webhook-secret=prod_mock_webhook",
    "jwt.secret=mock_prod_jwt_secret_must_be_very_long_for_hmac256"
})
public class WalletControllerProdSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(username = "customer@luxesuite.com", roles = "CUSTOMER")
    public void givenProdProfile_whenMockTopup_thenNotFound() throws Exception {
        String payload = """
                {
                    "amount": 100
                }
                """;

        mockMvc.perform(post("/api/v1/wallet/topup/mock")
                .secure(true)
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isNotFound());
    }
}
