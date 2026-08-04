package com.luxesuite.api.service;

import com.luxesuite.api.dto.CustomerNoteDto;
import com.luxesuite.api.model.Customer;
import com.luxesuite.api.model.CustomerNote;
import com.luxesuite.api.model.Staff;
import com.luxesuite.api.repository.CustomerNoteRepository;
import com.luxesuite.api.repository.CustomerRepository;
import com.luxesuite.api.repository.StaffRepository;
import com.luxesuite.api.exception.ResourceNotFoundException;
import com.luxesuite.api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerNoteService {

    private final CustomerNoteRepository customerNoteRepository;
    private final CustomerRepository customerRepository;
    private final StaffRepository staffRepository;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public List<CustomerNoteDto> getNotesForCustomer(Long customerId) {
        customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return customerNoteRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CustomerNoteDto addNote(Long customerId, CustomerNoteDto dto) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        CustomerNote note = new CustomerNote();
        note.setCustomer(customer);
        note.setContent(dto.getContent());

        // If a staffId is provided, attach the author
        if (dto.getStaffId() != null) {
            Staff staff = staffRepository.findById(dto.getStaffId())
                    .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
            note.setAuthor(staff);
        }

        CustomerNote saved = customerNoteRepository.save(note);
        return mapToDto(saved);
    }

    private CustomerNoteDto mapToDto(CustomerNote note) {
        CustomerNoteDto dto = new CustomerNoteDto();
        dto.setId(note.getId());
        dto.setCustomerId(note.getCustomer().getId());
        if (note.getAuthor() != null) {
            dto.setStaffId(note.getAuthor().getId());
            dto.setStaffName(note.getAuthor().getUser() != null
                    ? note.getAuthor().getUser().getFirstName() + " " + note.getAuthor().getUser().getLastName()
                    : "Staff #" + note.getAuthor().getId());
        }
        dto.setContent(note.getContent());
        dto.setCreatedAt(note.getCreatedAt());
        return dto;
    }
}
