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

    @Transactional(readOnly = true)
    public List<BranchDto> getAllBranches() {
        return branchRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BranchDto getBranchById(Long id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id " + id));
        return mapToDto(branch);
    }

    @Transactional
    public BranchDto createBranch(BranchDto dto) {
        Branch branch = Branch.builder()
                .name(dto.getName())
                .address(dto.getAddress())
                .taxId(dto.getTaxId())
                .timezone(dto.getTimezone())
                .phone(dto.getPhone())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
                
        Branch saved = branchRepository.save(branch);
        return mapToDto(saved);
    }

    @Transactional
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
        
        Branch updated = branchRepository.save(branch);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteBranch(Long id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id " + id));
        branchRepository.delete(branch);
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
                .createdAt(branch.getCreatedAt())
                .updatedAt(branch.getUpdatedAt())
                .build();
    }
}
