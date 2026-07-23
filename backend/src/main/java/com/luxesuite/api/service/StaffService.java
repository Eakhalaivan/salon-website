package com.luxesuite.api.service;

import com.luxesuite.api.dto.StaffDto;
import com.luxesuite.api.model.Branch;
import com.luxesuite.api.model.Service;
import com.luxesuite.api.model.Staff;
import com.luxesuite.api.model.User;
import com.luxesuite.api.repository.BranchRepository;
import com.luxesuite.api.repository.ServiceRepository;
import com.luxesuite.api.repository.StaffRepository;
import com.luxesuite.api.repository.UserRepository;
import com.luxesuite.api.model.Role;
import com.luxesuite.api.repository.RoleRepository;
import com.luxesuite.api.exception.ResourceNotFoundException;
import com.luxesuite.api.exception.BadRequestException;
import com.luxesuite.api.security.SecurityUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import com.luxesuite.api.dto.PageResponse;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class StaffService {

    private final StaffRepository staffRepository;
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;
    private final BranchRepository branchRepository;
    private final ServiceRepository serviceRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PageResponse<StaffDto> getAllStaff(int page, int size, String businessType) {
        String bType = businessType != null ? businessType : "BOTH";
        List<String> validTypes = "BOTH".equals(bType) ? java.util.Arrays.asList("SPA", "SALON", "BOTH") : java.util.Arrays.asList("BOTH", bType);
        Page<Staff> staffPage = staffRepository.findByUserIsActiveTrueAndBusinessTypeIn(validTypes, PageRequest.of(page, size));
        return PageResponse.of(staffPage.map(this::mapToDto));
    }

    @Transactional(readOnly = true)
    public PageResponse<StaffDto> getStaffByBranch(Long branchId, int page, int size, String businessType) {
        securityUtils.validateBranchAccess(branchId);
        String bType = businessType != null ? businessType : "BOTH";
        List<String> validTypes = "BOTH".equals(bType) ? java.util.Arrays.asList("SPA", "SALON", "BOTH") : java.util.Arrays.asList("BOTH", bType);
        Page<Staff> staffPage = staffRepository.findByBranchIdAndUserIsActiveTrueAndBusinessTypeIn(branchId, validTypes, PageRequest.of(page, size));
        return PageResponse.of(staffPage.map(this::mapToDto));
    }

    @Transactional(readOnly = true)
    public StaffDto getStaffById(Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        return mapToDto(staff);
    }

    @Transactional
    public StaffDto createStaff(StaffDto dto) {
        securityUtils.validateBranchAccess(dto.getBranchId());
        User user;
        if (dto.getUserId() != null) {
            user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        } else {
            String roleName = dto.getRoleName() != null ? dto.getRoleName() : "STAFF";
            Role staffRole = roleRepository.findByName(roleName)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));
            
            user = User.builder()
                    .firstName(dto.getFirstName())
                    .lastName(dto.getLastName())
                    .email(dto.getEmail())
                    .phone(dto.getPhone())
                    .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString())) // generate random password, should send email to reset
                    .role(staffRole)
                    .isActive(true)
                    .build();
            user = userRepository.save(user);
        }
        
        Branch branch = branchRepository.findById(dto.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
        
        Staff staff = new Staff();
        staff.setUser(user);
        staff.setBranch(branch);
        staff.setBaseSalary(dto.getBaseSalary());
        staff.setCommissionRate(dto.getCommissionRate());
        
        staff.setBusinessType(dto.getBusinessType() != null ? dto.getBusinessType() : "BOTH");
        
        if (dto.getServiceIds() != null && !dto.getServiceIds().isEmpty()) {
            Set<Service> services = new HashSet<>(serviceRepository.findAllById(dto.getServiceIds()));
            staff.setServices(services);
        }

        return mapToDto(staffRepository.save(staff));
    }

    @Transactional
    public StaffDto updateStaff(Long id, StaffDto dto) {
        Staff existing = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
                
        securityUtils.validateBranchAccess(existing.getBranch().getId());
        
        Branch branch = branchRepository.findById(dto.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
        
        existing.setBranch(branch);
        existing.setBaseSalary(dto.getBaseSalary());
        existing.setCommissionRate(dto.getCommissionRate());
        
        if (dto.getBusinessType() != null) {
            existing.setBusinessType(dto.getBusinessType());
        }
        
        if (dto.getServiceIds() != null) {
            Set<Service> services = new HashSet<>(serviceRepository.findAllById(dto.getServiceIds()));
            existing.setServices(services);
        }
        
        return mapToDto(staffRepository.save(existing));
    }

    @Transactional
    public void deleteStaff(Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        securityUtils.validateBranchAccess(staff.getBranch().getId());
        User user = staff.getUser();
        user.setIsActive(false);
        userRepository.save(user);
    }

    private StaffDto mapToDto(Staff staff) {
        StaffDto dto = new StaffDto();
        dto.setId(staff.getId());
        dto.setUserId(staff.getUser().getId());
        dto.setBranchId(staff.getBranch().getId());
        dto.setBaseSalary(staff.getBaseSalary());
        dto.setCommissionRate(staff.getCommissionRate());

        // Map user profile fields so the frontend doesn't need to nest-join
        dto.setFirstName(staff.getUser().getFirstName());
        dto.setLastName(staff.getUser().getLastName());
        dto.setEmail(staff.getUser().getEmail());
        dto.setPhone(staff.getUser().getPhone());
        if (staff.getUser().getRole() != null) {
            dto.setRoleName(staff.getUser().getRole().getName());
        }
        
        if (staff.getServices() != null) {
            dto.setServiceIds(staff.getServices().stream().map(Service::getId).collect(Collectors.toSet()));
        }
        
        dto.setBusinessType(staff.getBusinessType());
        return dto;
    }
}
