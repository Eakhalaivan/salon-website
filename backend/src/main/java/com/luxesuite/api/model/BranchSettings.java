package com.luxesuite.api.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class BranchSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;
    
    private String businessName;
    private String email;
    private String phone;
    private String currency;
    private String timeZone;
    private boolean maintenanceMode;
}
