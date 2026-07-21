package com.luxesuite.api.service;

import com.luxesuite.api.dto.CouponValidationResult;
import com.luxesuite.api.model.Coupon;
import com.luxesuite.api.repository.CouponRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CouponServiceTest {

    @Mock
    private CouponRepository couponRepository;

    @InjectMocks
    private CouponService couponService;

    private Coupon validCoupon;

    @BeforeEach
    void setUp() {
        validCoupon = new Coupon();
        validCoupon.setId(1L);
        validCoupon.setCode("SUMMER20");
        validCoupon.setDiscountType("PERCENTAGE");
        validCoupon.setDiscountValue(new BigDecimal("20.00"));
        validCoupon.setValidFrom(LocalDateTime.now().minusDays(1));
        validCoupon.setValidUntil(LocalDateTime.now().plusDays(10));
        validCoupon.setActive(true);
        validCoupon.setTimesUsed(0);
        validCoupon.setUsageLimit(100);
    }

    @Test
    void testValidateCoupon_Valid() {
        when(couponRepository.findByCodeIgnoreCase("SUMMER20")).thenReturn(Optional.of(validCoupon));

        CouponValidationResult result = couponService.validateCoupon("SUMMER20", new BigDecimal("100.00"));
        assertTrue(result.isValid());
        assertEquals("SUMMER20", result.getCode());
        // 20% of 100
        assertEquals(0, new BigDecimal("20.00").compareTo(result.getDiscountAmount()));
    }

    @Test
    void testValidateCoupon_Expired() {
        validCoupon.setValidUntil(LocalDateTime.now().minusDays(1));
        when(couponRepository.findByCodeIgnoreCase("SUMMER20")).thenReturn(Optional.of(validCoupon));

        CouponValidationResult result = couponService.validateCoupon("SUMMER20", new BigDecimal("100.00"));
        assertFalse(result.isValid());
        assertTrue(result.getMessage().contains("expired"));
    }
}
