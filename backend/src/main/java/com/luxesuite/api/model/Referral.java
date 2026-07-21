package com.luxesuite.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "referrals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Referral {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referrer_customer_id", nullable = false)
    private Customer referrer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referred_customer_id", nullable = false)
    private Customer referred;

    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private String status; // PENDING, COMPLETED

    @Column(name = "reward_issued")
    private Boolean rewardIssued;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (rewardIssued == null) rewardIssued = false;
    }
}
