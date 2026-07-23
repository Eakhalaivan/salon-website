package com.luxesuite.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "branches")
@SQLDelete(sql = "UPDATE branches SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Branch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "tax_id")
    private String taxId;

    @Column(name = "timezone")
    private String timezone;

    @Column(name = "phone")
    private String phone;

    @Column(name = "is_active")
    private Boolean isActive;

    @Builder.Default
    @Column(name = "business_type")
    private String businessType = "BOTH"; // SALON, SPA, BOTH

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

        @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (timezone == null) timezone = "UTC";
        if (isActive == null) isActive = true;
        if (businessType == null) businessType = "BOTH";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
