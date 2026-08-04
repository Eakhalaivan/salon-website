package com.luxesuite.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "appointments", indexes = {
    @Index(name = "idx_appointment_status", columnList = "status"),
    @Index(name = "idx_appointment_created_at", columnList = "created_at")
})
@SQLDelete(sql = "UPDATE appointments SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status;

    @Column(name = "total_price", precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "reminder_sent_at")
    private LocalDateTime reminderSentAt;

    @Column(name = "reminder_24h_sent")
    private Boolean reminder24hSent;

    @Column(name = "reminder_2h_sent")
    private Boolean reminder2hSent;

    @Column(name = "deposit_amount", precision = 10, scale = 2)
    private BigDecimal depositAmount;

    @Column(name = "is_deposit_paid")
    private Boolean isDepositPaid;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_walk_in")
    private Boolean isWalkIn;

    @OneToMany(mappedBy = "appointment", cascade = CascadeType.ALL, orphanRemoval = true)
    @org.hibernate.annotations.BatchSize(size = 25)
    private List<AppointmentItem> services = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder.Default
    @Column(name = "business_type", nullable = false)
    private String businessType = "BOTH";

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "rebooking_nudge_sent")
    private Boolean rebookingNudgeSent;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = AppointmentStatus.BOOKED;
        if (totalPrice == null) totalPrice = BigDecimal.ZERO;
        if (isWalkIn == null) isWalkIn = false;
        if (reminder24hSent == null) reminder24hSent = false;
        if (reminder2hSent == null) reminder2hSent = false;
        if (depositAmount == null) depositAmount = BigDecimal.ZERO;
        if (isDepositPaid == null) isDepositPaid = false;
        if (rebookingNudgeSent == null) rebookingNudgeSent = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
