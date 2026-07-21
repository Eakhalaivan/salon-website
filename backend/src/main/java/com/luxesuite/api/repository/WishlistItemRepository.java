package com.luxesuite.api.repository;

import com.luxesuite.api.model.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByCustomerIdOrderByAddedAtDesc(Long customerId);
    Optional<WishlistItem> findByCustomerIdAndProductId(Long customerId, Long productId);
    void deleteByCustomerIdAndProductId(Long customerId, Long productId);
    boolean existsByCustomerIdAndProductId(Long customerId, Long productId);
}
