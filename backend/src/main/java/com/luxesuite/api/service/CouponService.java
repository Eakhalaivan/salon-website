package com.luxesuite.api.service;

import com.luxesuite.api.dto.CouponDto;
import com.luxesuite.api.dto.CouponValidationResult;
import com.luxesuite.api.dto.PageResponse;
import com.luxesuite.api.exception.BadRequestException;
import com.luxesuite.api.model.Coupon;
import com.luxesuite.api.model.Invoice;
import com.luxesuite.api.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    @Transactional(readOnly = true)
    public PageResponse<CouponDto> listCoupons(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Coupon> couponPage = couponRepository.findAll(pageable);
        return new PageResponse<>(
                couponPage.getContent().stream().map(this::mapToDto).collect(Collectors.toList()),
                couponPage.getNumber(),
                couponPage.getSize(),
                couponPage.getTotalElements(),
                couponPage.getTotalPages(),
                couponPage.isLast()
        );
    }

    @Transactional
    public CouponDto createCoupon(CouponDto dto) {
        if (couponRepository.findByCodeIgnoreCase(dto.getCode()).isPresent()) {
            throw new BadRequestException("Coupon code already exists");
        }

        Coupon coupon = Coupon.builder()
                .code(dto.getCode().toUpperCase())
                .discountType(dto.getDiscountType())
                .discountValue(dto.getDiscountValue())
                .minOrderAmount(dto.getMinOrderAmount())
                .validFrom(dto.getValidFrom())
                .validUntil(dto.getValidUntil())
                .usageLimit(dto.getUsageLimit())
                .timesUsed(0)
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();

        return mapToDto(couponRepository.save(coupon));
    }

    @Transactional(readOnly = true)
    public CouponValidationResult validateCoupon(String code, BigDecimal orderTotal) {
        if (code == null || code.trim().isEmpty()) {
            return new CouponValidationResult(false, "Invalid coupon code", BigDecimal.ZERO, null);
        }

        Optional<Coupon> optionalCoupon = couponRepository.findByCodeIgnoreCase(code.trim());
        if (optionalCoupon.isEmpty()) {
            return new CouponValidationResult(false, "Coupon not found", BigDecimal.ZERO, null);
        }

        Coupon coupon = optionalCoupon.get();
        if (!coupon.getActive()) {
            return new CouponValidationResult(false, "Coupon is inactive", BigDecimal.ZERO, null);
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getValidFrom() != null && now.isBefore(coupon.getValidFrom())) {
            return new CouponValidationResult(false, "Coupon is not yet valid", BigDecimal.ZERO, null);
        }
        if (coupon.getValidUntil() != null && now.isAfter(coupon.getValidUntil())) {
            return new CouponValidationResult(false, "Coupon has expired", BigDecimal.ZERO, null);
        }

        if (coupon.getUsageLimit() != null && coupon.getTimesUsed() >= coupon.getUsageLimit()) {
            return new CouponValidationResult(false, "Coupon usage limit reached", BigDecimal.ZERO, null);
        }

        if (coupon.getMinOrderAmount() != null && orderTotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            return new CouponValidationResult(false, "Minimum order amount not met", BigDecimal.ZERO, null);
        }

        BigDecimal discount = calculateDiscount(coupon, orderTotal);

        return new CouponValidationResult(true, "Coupon valid", discount, coupon.getCode());
    }

    @Transactional
    public void applyCoupon(String code, Invoice invoice) {
        if (code == null || code.trim().isEmpty()) return;

        CouponValidationResult validation = validateCoupon(code, invoice.getSubtotal());
        if (validation.isValid()) {
            // Add the coupon discount on top of any existing discount (like subscription discount)
            BigDecimal existingDiscount = invoice.getDiscountAmount() != null ? invoice.getDiscountAmount() : BigDecimal.ZERO;
            invoice.setDiscountAmount(existingDiscount.add(validation.getDiscountAmount()));
            
            invoice.setCouponCode(validation.getCode());
            invoice.setCouponDiscount(validation.getDiscountAmount());

            // Increment usage
            Coupon coupon = couponRepository.findByCodeIgnoreCase(code.trim()).get();
            coupon.setTimesUsed(coupon.getTimesUsed() + 1);
            couponRepository.save(coupon);
        }
    }

    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal total) {
        if ("FIXED".equalsIgnoreCase(coupon.getDiscountType())) {
            return coupon.getDiscountValue().min(total);
        } else if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
            BigDecimal percent = coupon.getDiscountValue().divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            return total.multiply(percent).setScale(2, RoundingMode.HALF_UP);
        }
        return BigDecimal.ZERO;
    }

    private CouponDto mapToDto(Coupon coupon) {
        return CouponDto.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .minOrderAmount(coupon.getMinOrderAmount())
                .validFrom(coupon.getValidFrom())
                .validUntil(coupon.getValidUntil())
                .usageLimit(coupon.getUsageLimit())
                .timesUsed(coupon.getTimesUsed())
                .active(coupon.getActive())
                .build();
    }
}
