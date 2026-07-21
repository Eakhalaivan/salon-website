package com.luxesuite.api.repository;

import com.luxesuite.api.model.GiftCard;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

import java.util.Optional;

public interface GiftCardRepository extends JpaRepository<GiftCard, Long> {
    Optional<GiftCard> findByCode(String code);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT g FROM GiftCard g WHERE g.code = :code")
    Optional<GiftCard> findByCodeForUpdate(String code);
    Page<GiftCard> findByPurchasedByCustomerId(Long customerId, Pageable pageable);
    Page<GiftCard> findByRecipientCustomerId(Long customerId, Pageable pageable);
    Page<GiftCard> findBySourceOrderByCreatedAtDesc(String source, Pageable pageable);
}
