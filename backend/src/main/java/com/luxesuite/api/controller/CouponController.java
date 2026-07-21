package com.luxesuite.api.controller;

import com.luxesuite.api.dto.CouponDto;
import com.luxesuite.api.dto.CouponValidationResult;
import com.luxesuite.api.dto.PageResponse;
import com.luxesuite.api.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PageResponse<CouponDto>> listCoupons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(couponService.listCoupons(page, size));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<CouponDto> createCoupon(@Valid @RequestBody CouponDto dto) {
        return new ResponseEntity<>(couponService.createCoupon(dto), HttpStatus.CREATED);
    }

    @PostMapping("/validate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CouponValidationResult> validateCoupon(
            @RequestBody Map<String, Object> payload
    ) {
        String code = (String) payload.get("code");
        BigDecimal orderTotal = new BigDecimal(payload.getOrDefault("orderTotal", "0").toString());
        return ResponseEntity.ok(couponService.validateCoupon(code, orderTotal));
    }
}
