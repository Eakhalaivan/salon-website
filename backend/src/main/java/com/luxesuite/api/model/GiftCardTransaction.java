package com.luxesuite.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "gift_card_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GiftCardTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gift_card_id", nullable = false)
    private GiftCard giftCard;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String type; // PURCHASE, REDEMPTION, REFUND

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_invoice_id")
    private Invoice relatedInvoice;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
