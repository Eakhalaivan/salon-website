package com.luxesuite.api.controller;

import com.luxesuite.api.model.Invoice;
import com.luxesuite.api.service.BillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class BillingController {

    private final BillingService billingService;

    @PostMapping("/invoice/from-appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<Invoice> generateInvoice(
            @PathVariable Long appointmentId
    ) {
        log.info("Generating invoice for appointment ID: {}", appointmentId);
        Invoice invoice = billingService.generateInvoiceFromAppointment(appointmentId);
        log.info("Invoice generated successfully with ID: {}", invoice.getId());
        return ResponseEntity.ok(invoice);
    }
}
