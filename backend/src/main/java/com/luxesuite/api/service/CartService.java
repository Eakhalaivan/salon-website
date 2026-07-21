package com.luxesuite.api.service;

import com.luxesuite.api.dto.CartItemDto;
import com.luxesuite.api.dto.ProductDto;
import com.luxesuite.api.model.CartItem;
import com.luxesuite.api.model.Customer;
import com.luxesuite.api.model.Product;
import com.luxesuite.api.model.User;
import com.luxesuite.api.repository.CartItemRepository;
import com.luxesuite.api.repository.CustomerRepository;
import com.luxesuite.api.repository.ProductRepository;
import com.luxesuite.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<CartItemDto> getCartItems(String email) {
        Customer customer = getCustomer(email);
        return cartItemRepository.findByCustomerIdOrderByAddedAtDesc(customer.getId())
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public CartItemDto addItemToCart(String email, Long productId, Integer quantity) {
        Customer customer = getCustomer(email);
        Product product = productRepository.findById(productId).orElseThrow();

        CartItem item = cartItemRepository.findByCustomerIdAndProductId(customer.getId(), productId)
                .orElse(new CartItem());

        if (item.getId() == null) {
            item.setCustomer(customer);
            item.setProduct(product);
            item.setQuantity(quantity);
        } else {
            item.setQuantity(item.getQuantity() + quantity);
        }

        CartItem saved = cartItemRepository.save(item);
        return mapToDto(saved);
    }

    @Transactional
    public void updateQuantity(String email, Long productId, Integer quantity) {
        Customer customer = getCustomer(email);
        if (quantity <= 0) {
            cartItemRepository.deleteByCustomerIdAndProductId(customer.getId(), productId);
            return;
        }
        cartItemRepository.findByCustomerIdAndProductId(customer.getId(), productId).ifPresent(item -> {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        });
    }

    @Transactional
    public void removeItemFromCart(String email, Long productId) {
        Customer customer = getCustomer(email);
        cartItemRepository.deleteByCustomerIdAndProductId(customer.getId(), productId);
    }

    @Transactional
    public void clearCart(String email) {
        Customer customer = getCustomer(email);
        cartItemRepository.deleteByCustomerId(customer.getId());
    }

    private Customer getCustomer(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return customerRepository.findByUserId(user.getId()).orElseThrow();
    }

    private CartItemDto mapToDto(CartItem item) {
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
                
        return CartItemDto.builder()
                .id(item.getId())
                .productId(p.getId())
                .product(pDto)
                .quantity(item.getQuantity())
                .build();
    }
}
