package com.luxesuite.api.service;

import com.luxesuite.api.dto.WaitlistDto;
import com.luxesuite.api.model.Branch;
import com.luxesuite.api.model.Customer;
import com.luxesuite.api.model.Waitlist;
import com.luxesuite.api.repository.BranchRepository;
import com.luxesuite.api.repository.CustomerRepository;
import com.luxesuite.api.repository.ServiceRepository;
import com.luxesuite.api.repository.WaitlistRepository;
import com.luxesuite.api.exception.ResourceNotFoundException;
import com.luxesuite.api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WaitlistService {
    
    private final WaitlistRepository waitlistRepository;
    private final CustomerRepository customerRepository;
    private final BranchRepository branchRepository;
    private final ServiceRepository serviceRepository;
    private final SecurityUtils securityUtils;
    private final NotificationService notificationService;

    @Transactional
    public WaitlistDto joinWaitlist(WaitlistDto dto) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        securityUtils.validateCustomerOwnership(customer.getUser() != null ? customer.getUser().getId() : null);

        Branch branch = branchRepository.findById(dto.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        com.luxesuite.api.model.Service service = serviceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        Waitlist waitlist = new Waitlist();
        waitlist.setCustomer(customer);
        waitlist.setBranch(branch);
        waitlist.setService(service);
        waitlist.setPreferredDate(dto.getPreferredDate());
        waitlist.setStatus(Waitlist.WaitlistStatus.WAITING);
        
        Waitlist saved = waitlistRepository.save(waitlist);
        return mapToDto(saved);
    }

    public void notifyWaitlistForAvailability(Long branchId, LocalDate date) {
        List<Waitlist> waitingList = waitlistRepository.findByBranchIdAndPreferredDateAndStatusOrderByCreatedAtAsc(branchId, date, Waitlist.WaitlistStatus.WAITING);
        
        for (Waitlist w : waitingList) {
            String email = w.getCustomer().getUser() != null ? w.getCustomer().getUser().getEmail() : null;
            if (email != null) {
                notificationService.sendEmail(email, "Waitlist Alert: Availability at Lumina Spa", 
                    "Good news! An opening has become available on your preferred date: " + date + ". Please visit our website to book your appointment.");
                w.setStatus(Waitlist.WaitlistStatus.NOTIFIED);
                waitlistRepository.save(w);
                break; // Only notify the first person in line, or we could notify all
            }
        }
    }

    private WaitlistDto mapToDto(Waitlist waitlist) {
        WaitlistDto dto = new WaitlistDto();
        dto.setId(waitlist.getId());
        dto.setCustomerId(waitlist.getCustomer().getId());
        dto.setBranchId(waitlist.getBranch().getId());
        dto.setServiceId(waitlist.getService().getId());
        dto.setPreferredDate(waitlist.getPreferredDate());
        dto.setStatus(waitlist.getStatus().name());
        dto.setCreatedAt(waitlist.getCreatedAt());
        return dto;
    }
}
