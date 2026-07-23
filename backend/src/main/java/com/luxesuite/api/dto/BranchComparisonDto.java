package com.luxesuite.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BranchComparisonDto {
    private BranchStats branch1;
    private BranchStats branch2;

    @Data
    @Builder
    public static class BranchStats {
        private Long branchId;
        private Double totalRevenue;
        private Long appointmentCount;
        private Double averageRating;
    }
}
