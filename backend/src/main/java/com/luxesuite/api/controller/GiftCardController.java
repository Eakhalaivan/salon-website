package com.luxesuite.api.controller;

import com.luxesuite.api.dto.GiftCardDto;
import com.luxesuite.api.dto.GiftCardPurchaseRequest;
import com.luxesuite.api.dto.GiftCardRedeemRequest;
import com.luxesuite.api.dto.PageResponse;
import com.luxesuite.api.service.GiftCardService;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/gift-cards")
@RequiredArgsConstructor
public class GiftCardController {

    private final GiftCardService giftCardService;

    // Creates a stripe payment intent for purchasing a gift card
    @PostMapping("/purchase")
    public ResponseEntity<Map<String, Object>> purchaseGiftCard(@RequestBody GiftCardPurchaseRequest request) {
        try {
            GiftCardDto giftCard = giftCardService.createGiftCard(
                request.getAmount(), 
                request.getRecipientEmail(), 
                request.getRecipientName()
            );
            
            PaymentIntentCreateParams params =
                PaymentIntentCreateParams.builder()
                    .setAmount(request.getAmount().multiply(new BigDecimal(100)).longValue())
                    .setCurrency("inr")
                    .putMetadata("giftCardCode", giftCard.getCode())
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);
            String clientSecret = intent.getClientSecret();
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "clientSecret", clientSecret,
                "giftCard", giftCard
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PageResponse<GiftCardDto>> getMyGiftCards(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(giftCardService.getMyGiftCards(page, size));
    }

    @PostMapping("/redeem")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<Map<String, BigDecimal>> redeemGiftCard(@RequestBody GiftCardRedeemRequest request) {
        BigDecimal newBalance = giftCardService.redeem(request.getCode(), request.getAmount(), request.getInvoiceId());
        return ResponseEntity.ok(Map.of("newBalance", newBalance));
    }

    @GetMapping("/{code}/balance")
    public ResponseEntity<Map<String, BigDecimal>> checkBalance(@PathVariable String code) {
        // Rate limiting should be handled by an API Gateway or Filter, but for this basic logic we just return balance
        BigDecimal balance = giftCardService.checkBalance(code);
        return ResponseEntity.ok(Map.of("balance", balance));
    }
    @PostMapping("/admin/send")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<GiftCardDto> sendGiftCardFromAdmin(
            @RequestBody @jakarta.validation.Valid com.luxesuite.api.dto.AdminGiftCardSendRequest request) {
        return ResponseEntity.ok(giftCardService.sendGiftCardFromAdmin(request));
    }

    @GetMapping("/admin/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PageResponse<GiftCardDto>> getAdminGiftCardsHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(giftCardService.getAdminGiftCardsHistory(page, size));
    }

    @PostMapping("/admin-gift/redeem")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<Map<String, Object>> redeemAdminGiftCard(
            @RequestBody Map<String, Object> payload) {
        String code = (String) payload.get("code");
        Long customerId = ((Number) payload.get("customerId")).longValue();
        BigDecimal amount = giftCardService.redeemAdminGiftCard(code, customerId);
        return ResponseEntity.ok(Map.of("redeemedAmount", amount, "status", "success"));
    }

    @GetMapping("/me/received")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PageResponse<GiftCardDto>> getReceivedGiftCards(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(giftCardService.getReceivedGiftCards(page, size));
    }
}
