package com.luxesuite.api.controller;

import com.luxesuite.api.model.*;
import com.luxesuite.api.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class PaymentLifecycleIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private BranchRepository branchRepository;

    // Removed PaymentRepository since it doesn't exist
    
    private Invoice testInvoice;

    @BeforeEach
    public void setup() {
        Customer customer = new Customer();
        customer.setFirstName("Test");
        customer.setLastName("User");
        customer.setEmail("test_payment@example.com");
        customer.setPhone("1234567890");
        customer = customerRepository.save(customer);

        Branch branch = new Branch();
        branch.setName("Test Branch");
        branch = branchRepository.save(branch);

        testInvoice = new Invoice();
        testInvoice.setCustomer(customer);
        testInvoice.setBranch(branch);
        testInvoice.setStatus("PENDING");
        testInvoice.setTotalAmount(new BigDecimal("1000.00"));
        testInvoice = invoiceRepository.save(testInvoice);
    }

    private String generateSignature(String payload, String secret) throws Exception {
        Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secret_key = new SecretKeySpec(secret.getBytes("UTF-8"), "HmacSHA256");
        sha256_HMAC.init(secret_key);
        byte[] raw = sha256_HMAC.doFinal(payload.getBytes("UTF-8"));
        
        // Razorpay uses Hex encoding
        StringBuilder hexString = new StringBuilder();
        for (byte b : raw) {
            String hex = Integer.toHexString(0xff & b);
            if(hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }

    @Test
    public void givenValidWebhook_whenProcessed_thenInvoiceMarkedPaid() throws Exception {
        String payload = """
        {
          "event": "payment.captured",
          "payload": {
            "payment": {
              "entity": {
                "id": "pay_test123",
                "amount": 100000,
                "notes": {
                  "invoiceId": "%d"
                }
              }
            }
          }
        }
        """.formatted(testInvoice.getId());

        String signature = generateSignature(payload, "dummy_webhook_secret");

        mockMvc.perform(post("/api/v1/payments/razorpay/webhook")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload)
                .header("X-Razorpay-Signature", signature))
                .andExpect(status().isOk());

        // Verify invoice is paid
        Invoice updatedInvoice = invoiceRepository.findById(testInvoice.getId()).get();
        assertEquals("PAID", updatedInvoice.getStatus());
        assertEquals(1, updatedInvoice.getPayments().size());
        assertEquals("SUCCESS", updatedInvoice.getPayments().get(0).getStatus());
        assertEquals("pay_test123", updatedInvoice.getPayments().get(0).getTransactionRef());
    }

    @Test
    public void givenDuplicateWebhook_whenProcessed_thenIdempotencyMaintained() throws Exception {
        String payload = """
        {
          "event": "payment.captured",
          "payload": {
            "payment": {
              "entity": {
                "id": "pay_duplicate_test123",
                "amount": 100000,
                "notes": {
                  "invoiceId": "%d"
                }
              }
            }
          }
        }
        """.formatted(testInvoice.getId());

        String signature = generateSignature(payload, "dummy_webhook_secret");

        // First webhook
        mockMvc.perform(post("/api/v1/payments/razorpay/webhook")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload)
                .header("X-Razorpay-Signature", signature))
                .andExpect(status().isOk());

        // Second identical webhook
        mockMvc.perform(post("/api/v1/payments/razorpay/webhook")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload)
                .header("X-Razorpay-Signature", signature))
                .andExpect(status().isOk());

        // Verify idempotency (only 1 payment created)
        Invoice updatedInvoice = invoiceRepository.findById(testInvoice.getId()).get();
        assertEquals("PAID", updatedInvoice.getStatus());
        assertEquals(1, updatedInvoice.getPayments().size(), "Should not create duplicate payments");
    }

    @Test
    public void givenInvalidSignature_whenProcessed_thenBadRequest() throws Exception {
        String payload = """
        {
          "event": "payment.captured",
          "payload": {
            "payment": {
              "entity": {
                "id": "pay_test123",
                "amount": 100000,
                "notes": {
                  "invoiceId": "%d"
                }
              }
            }
          }
        }
        """.formatted(testInvoice.getId());

        String badSignature = "invalid_signature_hex_string";

        mockMvc.perform(post("/api/v1/payments/razorpay/webhook")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload)
                .header("X-Razorpay-Signature", badSignature))
                .andExpect(status().isBadGateway()); // Maps to 502 Bad Gateway

        // Verify invoice is NOT paid
        Invoice updatedInvoice = invoiceRepository.findById(testInvoice.getId()).get();
        assertEquals("PENDING", updatedInvoice.getStatus());
        assertEquals(0, updatedInvoice.getPayments().size());
    }
}
