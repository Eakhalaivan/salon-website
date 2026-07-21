package com.luxesuite.api.security;

import com.luxesuite.api.model.User;
import com.luxesuite.api.model.Staff;
import com.luxesuite.api.exception.ForbiddenException;
import com.luxesuite.api.exception.UnauthorizedException;
import com.luxesuite.api.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final StaffRepository staffRepository;

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            return userDetails.getUser();
        }
        throw new UnauthorizedException("User not authenticated");
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public String getCurrentUserEmail() {
        return getCurrentUser().getEmail();
    }

    public boolean hasRole(String roleName) {
        return getCurrentUser().getRole().getName().equals(roleName);
    }

    public void validateCustomerOwnership(Long targetUserId) {
        User currentUser = getCurrentUser();
        
        if ("CUSTOMER".equals(currentUser.getRole().getName())) {
            if (targetUserId == null || !targetUserId.equals(currentUser.getId())) {
                throw new ForbiddenException("Unauthorized: You can only access your own data.");
            }
        }
    }

    public boolean isCustomerOwner(Long targetUserId) {
        try {
            validateCustomerOwnership(targetUserId);
            return true;
        } catch (ForbiddenException e) {
            return false;
        }
    }

    public void validateBranchAccess(Long branchId) {
        User currentUser = getCurrentUser();
        
        if ("ADMIN".equals(currentUser.getRole().getName())) {
            return;
        }
        
        Staff staff = staffRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ForbiddenException("Unauthorized: No staff profile found for current user."));
                
        if (staff.getBranch() == null || !staff.getBranch().getId().equals(branchId)) {
            throw new ForbiddenException("Unauthorized: You can only access data for your assigned branch.");
        }
    }
}
