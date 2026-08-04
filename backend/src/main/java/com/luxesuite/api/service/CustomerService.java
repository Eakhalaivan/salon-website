package com.luxesuite.api.service;

import com.luxesuite.api.dto.CustomerDto;
import com.luxesuite.api.model.Customer;
import com.luxesuite.api.repository.CustomerRepository;
import com.luxesuite.api.exception.ResourceNotFoundException;
import com.luxesuite.api.exception.ForbiddenException;
import com.luxesuite.api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.luxesuite.api.repository.AppointmentRepository;
import com.luxesuite.api.repository.InvoiceRepository;
import com.luxesuite.api.repository.LoyaltyTransactionRepository;
import com.luxesuite.api.model.Appointment;
import com.luxesuite.api.model.AppointmentStatus;
import com.luxesuite.api.model.Invoice;
import com.luxesuite.api.model.LoyaltyTransaction;
import com.luxesuite.api.dto.ActivityDto;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import com.luxesuite.api.dto.PageResponse;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final AppointmentRepository appointmentRepository;
    private final InvoiceRepository invoiceRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public PageResponse<CustomerDto> getAllCustomers(String search, int page, int size) {
        Page<Customer> customerPage;
        if (search != null && !search.trim().isEmpty()) {
            customerPage = customerRepository.searchCustomers(search.trim(), PageRequest.of(page, size));
        } else {
            customerPage = customerRepository.findAll(PageRequest.of(page, size));
        }
        return PageResponse.of(customerPage.map(this::mapToDto));
    }

    @Transactional(readOnly = true)
    public CustomerDto getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        securityUtils.validateCustomerOwnership(customer.getUser() != null ? customer.getUser().getId() : null);
        return mapToDto(customer);
    }

    @Transactional
    public CustomerDto createCustomer(CustomerDto dto) {
        Customer customer = mapToEntity(dto);
        return mapToDto(customerRepository.save(customer));
    }

    @Transactional(readOnly = true)
    public CustomerDto getMyProfile() {
        Customer customer = getCurrentCustomer();
        return mapToDto(customer);
    }

    @Transactional
    public CustomerDto updateMyProfile(CustomerDto dto) {
        Customer existing = getCurrentCustomer();
        
        existing.setFirstName(dto.getFirstName());
        existing.setLastName(dto.getLastName());
        if (dto.getPhone() != null) existing.setPhone(dto.getPhone());
        if (dto.getNotes() != null) existing.setNotes(dto.getNotes());
        if (dto.getProfilePhoto() != null) existing.setProfilePhoto(dto.getProfilePhoto());
        if (dto.getDateOfBirth() != null) existing.setDateOfBirth(dto.getDateOfBirth());
        
        return mapToDto(customerRepository.save(existing));
    }

    private Customer getCurrentCustomer() {
        com.luxesuite.api.model.User user = securityUtils.getCurrentUser();
        return customerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found for current user"));
    }

    @Transactional(readOnly = true)
    public List<ActivityDto> getMyActivity() {
        Customer customer = getCurrentCustomer();
        List<ActivityDto> activities = new java.util.ArrayList<>();

        List<Appointment> appointments = appointmentRepository.findByCustomerId(customer.getId());
        for (Appointment app : appointments) {
            String title = "Appointment Booked";
            if (app.getStatus() == AppointmentStatus.COMPLETED) {
                title = "Appointment Completed";
            } else if (app.getStatus() == AppointmentStatus.CANCELLED) {
                title = "Appointment Cancelled";
            }
            String desc = app.getServices() != null && !app.getServices().isEmpty() ? app.getServices().get(0).getService().getName() : "Service";
            activities.add(new ActivityDto("APPOINTMENT", title, desc, app.getCreatedAt(), "event_available"));
        }

        List<Invoice> invoices = invoiceRepository.findByCustomerId(customer.getId());
        for (Invoice inv : invoices) {
            activities.add(new ActivityDto("ORDER", "Order Placed", "Total: " + inv.getTotalAmount(), inv.getCreatedAt(), "shopping_cart"));
        }

        org.springframework.data.domain.Page<LoyaltyTransaction> pts = loyaltyTransactionRepository.findByCustomerId(customer.getId(), org.springframework.data.domain.PageRequest.of(0, 50));
        for (LoyaltyTransaction pt : pts.getContent()) {
            activities.add(new ActivityDto("LOYALTY", "Points " + (pt.getPointsDelta() > 0 ? "Earned" : "Redeemed"), pt.getReason(), pt.getCreatedAt(), "loyalty"));
        }

        activities.sort(java.util.Comparator.comparing(ActivityDto::getDate).reversed());
        return activities.stream().limit(10).collect(Collectors.toList());
    }

    @Transactional
    public CustomerDto updateCustomer(Long id, CustomerDto dto) {
        Customer existing = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        
        securityUtils.validateCustomerOwnership(existing.getUser() != null ? existing.getUser().getId() : null);
        
        existing.setFirstName(dto.getFirstName());
        existing.setLastName(dto.getLastName());
        existing.setEmail(dto.getEmail());
        existing.setPhone(dto.getPhone());
        existing.setNotes(dto.getNotes());
        if (dto.getProfilePhoto() != null) existing.setProfilePhoto(dto.getProfilePhoto());
        if (dto.getDateOfBirth() != null) existing.setDateOfBirth(dto.getDateOfBirth());
        
        return mapToDto(customerRepository.save(existing));
    }

    @Transactional
    public void deleteCustomer(Long id) {
        customerRepository.deleteById(id);
    }



    private CustomerDto mapToDto(Customer customer) {
        CustomerDto dto = new CustomerDto();
        dto.setId(customer.getId());
        dto.setFirstName(customer.getFirstName());
        dto.setLastName(customer.getLastName());
        dto.setEmail(customer.getEmail());
        dto.setPhone(customer.getPhone());
        dto.setNotes(customer.getNotes());
        dto.setTotalPoints(customer.getTotalPoints());
        dto.setProfilePhoto(customer.getProfilePhoto());
        dto.setDateOfBirth(customer.getDateOfBirth());
        return dto;
    }

    private Customer mapToEntity(CustomerDto dto) {
        Customer customer = new Customer();
        customer.setFirstName(dto.getFirstName());
        customer.setLastName(dto.getLastName());
        customer.setEmail(dto.getEmail());
        customer.setPhone(dto.getPhone());
        customer.setNotes(dto.getNotes());
        customer.setTotalPoints(dto.getTotalPoints() != null ? dto.getTotalPoints() : 0);
        customer.setProfilePhoto(dto.getProfilePhoto());
        customer.setDateOfBirth(dto.getDateOfBirth());
        return customer;
    }
}
