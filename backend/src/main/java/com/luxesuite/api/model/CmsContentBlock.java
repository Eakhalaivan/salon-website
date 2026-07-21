package com.luxesuite.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cms_content_blocks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CmsContentBlock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "page_key", nullable = false)
    private String pageKey;

    @Column(name = "block_key", nullable = false)
    private String blockKey;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @Column(name = "content_value", columnDefinition = "TEXT")
    private String contentValue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
