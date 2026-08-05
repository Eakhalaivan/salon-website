package com.luxesuite.api.controller;

import com.luxesuite.api.model.StaffNote;
import com.luxesuite.api.model.Staff;
import com.luxesuite.api.repository.StaffNoteRepository;
import com.luxesuite.api.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import com.luxesuite.api.exception.ResourceNotFoundException;

@RestController
@RequestMapping("/api/v1/staff-notes")
@PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN', 'THERAPIST', 'RECEPTIONIST')")
public class StaffNoteController {

    @Autowired
    private StaffNoteRepository staffNoteRepository;
    @Autowired
    private StaffRepository staffRepository;

    private Staff requireStaffProfile(UserDetails userDetails) {
        return staffRepository.findByUserEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No staff profile is linked to this account (" + userDetails.getUsername() + ")."));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyNote(@AuthenticationPrincipal UserDetails userDetails) {
        Staff staff = requireStaffProfile(userDetails);
        // No note saved yet is a normal first-visit state, not an error condition -
        // return 200 with a null body instead of 404 so the client doesn't have to
        // treat "no note yet" as a failed request.
        return ResponseEntity.ok(staffNoteRepository.findByStaffId(staff.getId()).orElse(null));
    }

    @PostMapping("/me")
    public ResponseEntity<?> updateMyNote(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Map<String, String> payload) {
        Staff staff = requireStaffProfile(userDetails);
        StaffNote note = staffNoteRepository.findByStaffId(staff.getId()).orElse(new StaffNote());
        note.setStaff(staff);
        note.setContent(payload.get("content"));
        return ResponseEntity.ok(staffNoteRepository.save(note));
    }
}
