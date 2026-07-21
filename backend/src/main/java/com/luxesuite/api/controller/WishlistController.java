package com.luxesuite.api.controller;

import com.luxesuite.api.dto.WishlistItemDto;
import com.luxesuite.api.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers/me/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<WishlistItemDto>> getWishlist() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(wishlistService.getWishlist(email));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<WishlistItemDto> toggleWishlist(@PathVariable Long productId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        WishlistItemDto result = wishlistService.toggleWishlist(email, productId);
        if (result == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(result);
    }
}
