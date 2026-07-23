package com.luxesuite.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
@SQLDelete(sql = "UPDATE customers SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    private String email;

    private String phone;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "profile_photo", columnDefinition = "TEXT")
    private String profilePhoto;

    @Column(name = "referral_code", unique = true)
    private String referralCode;

    @Column(name = "total_points")
    private Integer totalPoints;

    @Column(name = "whatsapp_opt_in")
    private Boolean whatsappOptIn;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "family_group_id")
    private FamilyGroup familyGroup;

    @Column(name = "is_primary_member")
    private Boolean isPrimaryMember;

        @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (totalPoints == null) totalPoints = 0;
        if (isPrimaryMember == null) isPrimaryMember = false;
        if (whatsappOptIn == null) whatsappOptIn = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
