package com.luxesuite.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "whatsapp_message_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WhatsAppMessageLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(name = "template_name", nullable = false)
    private String templateName;

    @Column(nullable = false)
    private String status; // SENT, FAILED, SKIPPED_NO_PROVIDER

    @Column(name = "related_entity_type")
    private String relatedEntityType;

    @Column(name = "related_entity_id")
    private Long relatedEntityId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
