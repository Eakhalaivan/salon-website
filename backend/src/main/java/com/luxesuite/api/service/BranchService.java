package com.luxesuite.api.service;

import com.luxesuite.api.dto.BranchDto;
import com.luxesuite.api.exception.ResourceNotFoundException;
import com.luxesuite.api.model.Branch;
import com.luxesuite.api.repository.BranchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;
    private final com.luxesuite.api.repository.InvoiceRepository invoiceRepository;
    private final com.luxesuite.api.repository.AppointmentRepository appointmentRepository;
    private final com.luxesuite.api.repository.ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    @org.springframework.cache.annotation.Cacheable(value = "branches")
    public List<BranchDto> getAllBranches() {
        return branchRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @org.springframework.cache.annotation.Cacheable(value = "branches", key = "#id")
    public BranchDto getBranchById(Long id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id " + id));
        return mapToDto(branch);
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "branches", allEntries = true)
    public BranchDto createBranch(BranchDto dto) {
        Branch branch = Branch.builder()
                .name(dto.getName())
                .address(dto.getAddress())
                .taxId(dto.getTaxId())
                .timezone(dto.getTimezone())
                .phone(dto.getPhone())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .businessType(dto.getBusinessType() != null ? dto.getBusinessType() : "BOTH")
                .build();
                
        Branch saved = branchRepository.save(branch);
        return mapToDto(saved);
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "branches", allEntries = true)
    public BranchDto updateBranch(Long id, BranchDto dto) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id " + id));
                
        branch.setName(dto.getName());
        branch.setAddress(dto.getAddress());
        branch.setTaxId(dto.getTaxId());
        branch.setTimezone(dto.getTimezone());
        branch.setPhone(dto.getPhone());
        if (dto.getIsActive() != null) {
            branch.setIsActive(dto.getIsActive());
        }
        if (dto.getBusinessType() != null) {
            branch.setBusinessType(dto.getBusinessType());
        }
        
        Branch updated = branchRepository.save(branch);
        return mapToDto(updated);
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "branches", allEntries = true)
    public void deleteBranch(Long id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id " + id));
        branchRepository.delete(branch);
    }

    @Transactional(readOnly = true)
    public com.luxesuite.api.dto.BranchComparisonDto compareBranches(Long id1, Long id2) {
        return com.luxesuite.api.dto.BranchComparisonDto.builder()
                .branch1(getBranchStats(id1))
                .branch2(getBranchStats(id2))
                .build();
    }

    private com.luxesuite.api.dto.BranchComparisonDto.BranchStats getBranchStats(Long branchId) {
        branchRepository.findById(branchId).orElseThrow(() -> new ResourceNotFoundException("Branch not found with id " + branchId));
        
        Double revenue = invoiceRepository.getTotalRevenueByBranchId(branchId);
        Long appointments = appointmentRepository.countByBranchId(branchId);
        Double rating = reviewRepository.getAverageRatingByBranchId(branchId);

        return com.luxesuite.api.dto.BranchComparisonDto.BranchStats.builder()
                .branchId(branchId)
                .totalRevenue(revenue != null ? revenue : 0.0)
                .appointmentCount(appointments != null ? appointments : 0L)
                .averageRating(rating != null ? rating : 0.0)
                .build();
    }

    private BranchDto mapToDto(Branch branch) {
        return BranchDto.builder()
                .id(branch.getId())
                .name(branch.getName())
                .address(branch.getAddress())
                .taxId(branch.getTaxId())
                .timezone(branch.getTimezone())
                .phone(branch.getPhone())
                .isActive(branch.getIsActive())
                .businessType(branch.getBusinessType())
                .createdAt(branch.getCreatedAt())
                .updatedAt(branch.getUpdatedAt())
                .build();
    }
}
