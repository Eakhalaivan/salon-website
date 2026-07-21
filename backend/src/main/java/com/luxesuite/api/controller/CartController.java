package com.luxesuite.api.controller;

import com.luxesuite.api.dto.CartItemDto;
import com.luxesuite.api.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers/me/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItemDto>> getCartItems() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(cartService.getCartItems(email));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<CartItemDto> addItem(@PathVariable Long productId, @RequestParam(defaultValue = "1") Integer quantity) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(cartService.addItemToCart(email, productId, quantity));
    }

    @PutMapping("/{productId}")
    public ResponseEntity<Void> updateQuantity(@PathVariable Long productId, @RequestParam Integer quantity) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        cartService.updateQuantity(email, productId, quantity);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeItem(@PathVariable Long productId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        cartService.removeItemFromCart(email, productId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        cartService.clearCart(email);
        return ResponseEntity.ok().build();
    }
}
