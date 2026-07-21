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

@RestController
@RequestMapping("/api/v1/staff-notes")
@CrossOrigin(origins = "*", maxAge = 3600)
public class StaffNoteController {
    
    @Autowired
    private StaffNoteRepository staffNoteRepository;
    @Autowired
    private StaffRepository staffRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getMyNote(@AuthenticationPrincipal UserDetails userDetails) {
        Staff staff = staffRepository.findByUserEmail(userDetails.getUsername()).orElseThrow();
        return staffNoteRepository.findByStaffId(staff.getId())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/me")
    public ResponseEntity<?> updateMyNote(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Map<String, String> payload) {
        Staff staff = staffRepository.findByUserEmail(userDetails.getUsername()).orElseThrow();
        StaffNote note = staffNoteRepository.findByStaffId(staff.getId()).orElse(new StaffNote());
        note.setStaff(staff);
        note.setContent(payload.get("content"));
        return ResponseEntity.ok(staffNoteRepository.save(note));
    }
}
