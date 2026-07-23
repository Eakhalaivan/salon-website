package com.luxesuite.api.controller;

import com.luxesuite.api.model.LeaveRequest;
import com.luxesuite.api.model.Staff;
import com.luxesuite.api.repository.LeaveRequestRepository;
import com.luxesuite.api.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.access.AccessDeniedException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/leave-requests")
@PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
public class LeaveRequestController {
    
    @Autowired
    private LeaveRequestRepository leaveRequestRepository;
    @Autowired
    private StaffRepository staffRepository;

    @GetMapping("/me")
    public ResponseEntity<List<LeaveRequest>> getMyRequests(@AuthenticationPrincipal UserDetails userDetails) {
        Staff staff = staffRepository.findByUserEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(leaveRequestRepository.findByStaffId(staff.getId()));
    }

    @PostMapping("/me")
    public ResponseEntity<LeaveRequest> createRequest(@AuthenticationPrincipal UserDetails userDetails, @RequestBody LeaveRequest request) {
        Staff staff = staffRepository.findByUserEmail(userDetails.getUsername()).orElseThrow();
        request.setStaff(staff);
        request.setStatus("PENDING");
        return ResponseEntity.ok(leaveRequestRepository.save(request));
    }

    @GetMapping("/branch")
    public ResponseEntity<List<LeaveRequest>> getBranchRequests(@AuthenticationPrincipal UserDetails userDetails) {
        Staff staff = staffRepository.findByUserEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(leaveRequestRepository.findByStaffBranchId(staff.getBranch().getId()));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<LeaveRequest> updateStatus(
            @PathVariable Long id, 
            @RequestBody java.util.Map<String, String> payload,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        LeaveRequest req = leaveRequestRepository.findById(id).orElseThrow();
        String newStatus = payload.get("status");
        if (newStatus == null || (!newStatus.equals("APPROVED") && !newStatus.equals("REJECTED"))) {
            throw new IllegalArgumentException("Status must be APPROVED or REJECTED");
        }
        
        Staff callerStaff = staffRepository.findByUserEmail(userDetails.getUsername()).orElseThrow();
        boolean isAdmin = callerStaff.getUser().getRole().getName().equals("ADMIN");
        
        if (!isAdmin && !callerStaff.getBranch().getId().equals(req.getStaff().getBranch().getId())) {
            throw new AccessDeniedException("You can only approve leave requests for your own branch");
        }
        
        req.setStatus(newStatus);
        return ResponseEntity.ok(leaveRequestRepository.save(req));
    }
}
