package com.luxesuite.api.controller;

import com.luxesuite.api.model.Invoice;
import com.luxesuite.api.repository.InvoiceRepository;
import com.luxesuite.api.exception.ResourceNotFoundException;
import com.luxesuite.api.exception.ForbiddenException;
import com.luxesuite.api.security.SecurityUtils;
import com.luxesuite.api.service.CouponService;
import com.luxesuite.api.dto.InvoiceDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import com.luxesuite.api.dto.PageResponse;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;
    private final SecurityUtils securityUtils;
    private final CouponService couponService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<PageResponse<InvoiceDto>> getAllInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<Invoice> invoices = invoiceRepository.findAll(PageRequest.of(page, size));
        return ResponseEntity.ok(PageResponse.of(invoices.map(this::mapToDto)));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('CUSTOMER')")
    public ResponseEntity<PageResponse<InvoiceDto>> getMyInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long userId = securityUtils.getCurrentUser().getId();
        Page<Invoice> invoices = invoiceRepository.findByCustomerUserId(userId, PageRequest.of(page, size));
        return ResponseEntity.ok(PageResponse.of(invoices.map(this::mapToDto)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST', 'CUSTOMER')")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        
        securityUtils.validateCustomerOwnership(
                invoice.getCustomer() != null && invoice.getCustomer().getUser() != null 
                        ? invoice.getCustomer().getUser().getId() 
                        : null
        );
        
        return ResponseEntity.ok(invoice);
    }
    
    @PostMapping("/{id}/apply-coupon")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST', 'CUSTOMER')")
    public ResponseEntity<InvoiceDto> applyCoupon(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        
        securityUtils.validateCustomerOwnership(
                invoice.getCustomer() != null && invoice.getCustomer().getUser() != null 
                        ? invoice.getCustomer().getUser().getId() 
                        : null
        );
        
        String code = payload.get("code");
        couponService.applyCoupon(code, invoice);
        
        // Recalculate total amount after new discount
        java.math.BigDecimal subtotal = invoice.getSubtotal() != null ? invoice.getSubtotal() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal tax = invoice.getTaxAmount() != null ? invoice.getTaxAmount() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal discount = invoice.getDiscountAmount() != null ? invoice.getDiscountAmount() : java.math.BigDecimal.ZERO;
        invoice.setTotalAmount(subtotal.add(tax).subtract(discount).max(java.math.BigDecimal.ZERO));
        
        invoice = invoiceRepository.save(invoice);
        return ResponseEntity.ok(mapToDto(invoice));
    }
    
    private InvoiceDto mapToDto(Invoice invoice) {
        return InvoiceDto.builder()
                .id(invoice.getId())
                .customerId(invoice.getCustomer() != null ? invoice.getCustomer().getId() : null)
                .customerName(invoice.getCustomer() != null && invoice.getCustomer().getUser() != null 
                              ? invoice.getCustomer().getUser().getFirstName() + " " + invoice.getCustomer().getUser().getLastName() 
                              : null)
                .branchId(invoice.getBranch() != null ? invoice.getBranch().getId() : null)
                .appointmentId(invoice.getAppointment() != null ? invoice.getAppointment().getId() : null)
                .subtotal(invoice.getSubtotal())
                .taxAmount(invoice.getTaxAmount())
                .discountAmount(invoice.getDiscountAmount())
                .couponCode(invoice.getCouponCode())
                .couponDiscount(invoice.getCouponDiscount())
                .totalAmount(invoice.getTotalAmount())
                .status(invoice.getStatus())
                .createdAt(invoice.getCreatedAt())
                .updatedAt(invoice.getUpdatedAt())
                .build();
    }
}
