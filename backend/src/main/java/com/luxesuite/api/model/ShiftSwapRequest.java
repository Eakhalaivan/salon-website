package com.luxesuite.api.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "shift_swap_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftSwapRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_staff_id", nullable = false)
    private Staff requesterStaff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_shift_id", nullable = false)
    private Shift requesterShift;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_staff_id", nullable = false)
    private Staff targetStaff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_shift_id", nullable = false)
    private Shift targetShift;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SwapStatus status;

    @Column(name = "manager_notes", columnDefinition = "TEXT")
    private String managerNotes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
