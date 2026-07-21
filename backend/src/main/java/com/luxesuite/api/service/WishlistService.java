package com.luxesuite.api.service;

import com.luxesuite.api.dto.ProductDto;
import com.luxesuite.api.dto.WishlistItemDto;
import com.luxesuite.api.model.Customer;
import com.luxesuite.api.model.Product;
import com.luxesuite.api.model.User;
import com.luxesuite.api.model.WishlistItem;
import com.luxesuite.api.repository.CustomerRepository;
import com.luxesuite.api.repository.ProductRepository;
import com.luxesuite.api.repository.UserRepository;
import com.luxesuite.api.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistItemRepository wishlistRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<WishlistItemDto> getWishlist(String email) {
        Customer customer = getCustomer(email);
        return wishlistRepository.findByCustomerIdOrderByAddedAtDesc(customer.getId())
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public WishlistItemDto toggleWishlist(String email, Long productId) {
        Customer customer = getCustomer(email);
        Product product = productRepository.findById(productId).orElseThrow();

        if (wishlistRepository.existsByCustomerIdAndProductId(customer.getId(), productId)) {
            wishlistRepository.deleteByCustomerIdAndProductId(customer.getId(), productId);
            return null; // indicates removed
        }

        WishlistItem item = new WishlistItem();
        item.setCustomer(customer);
        item.setProduct(product);
        WishlistItem saved = wishlistRepository.save(item);
        return mapToDto(saved);
    }

    private Customer getCustomer(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return customerRepository.findByUserId(user.getId()).orElseThrow();
    }

    private WishlistItemDto mapToDto(WishlistItem item) {
        Product p = item.getProduct();
        ProductDto pDto = ProductDto.builder()
                .id(p.getId())
                .name(p.getName())
                .sku(p.getSku())
                .type(p.getType())
                .price(p.getPrice())
                .cost(p.getCost())
                .isActive(p.getIsActive())
                .build();

        return WishlistItemDto.builder()
                .id(item.getId())
                .productId(p.getId())
                .product(pDto)
                .build();
    }
}
