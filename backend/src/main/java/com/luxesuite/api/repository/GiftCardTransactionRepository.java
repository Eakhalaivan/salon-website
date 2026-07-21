package com.luxesuite.api.repository;

import com.luxesuite.api.model.GiftCardTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GiftCardTransactionRepository extends JpaRepository<GiftCardTransaction, Long> {
    Page<GiftCardTransaction> findByGiftCardId(Long giftCardId, Pageable pageable);
}
