package com.luxesuite.api.service;

import com.luxesuite.api.dto.AppointmentDto;
import com.luxesuite.api.dto.AppointmentItemDto;
import com.luxesuite.api.model.*;
import com.luxesuite.api.repository.*;
import com.luxesuite.api.exception.ResourceNotFoundException;
import com.luxesuite.api.exception.BadRequestException;
import com.luxesuite.api.exception.ConflictException;
import com.luxesuite.api.security.SecurityUtils;
import com.luxesuite.api.scheduler.NotificationScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentItemRepository appointmentItemRepository;
    private final CustomerRepository customerRepository;
    private final BranchRepository branchRepository;
    private final ServiceRepository serviceRepository;
    private final StaffRepository staffRepository;
    private final InventoryService inventoryService;
    private final SecurityUtils securityUtils;
    private final NotificationService notificationService;
    private final NotificationScheduler notificationScheduler;
    private final SseService sseService;

    @Transactional
    public AppointmentDto createAppointment(AppointmentDto dto) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        securityUtils.validateCustomerOwnership(customer.getUser() != null ? customer.getUser().getId() : null);
        Branch branch = branchRepository.findById(dto.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        Appointment appointment = new Appointment();
        appointment.setCustomer(customer);
        appointment.setBranch(branch);
        appointment.setNotes(dto.getNotes());
        
        BigDecimal totalPrice = BigDecimal.ZERO;

        if (dto.getServices() == null || dto.getServices().isEmpty()) {
            throw new BadRequestException("No services selected");
        }
        
        LocalDateTime currentStartTime = dto.getServices().get(0).getStartTime();
        boolean hasSpa = false;
        boolean hasSalon = false;

        for (AppointmentItemDto itemDto : dto.getServices()) {
            com.luxesuite.api.model.Service service = serviceRepository.findById(itemDto.getServiceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
            
            if ("SPA".equals(service.getBusinessType())) hasSpa = true;
            if ("SALON".equals(service.getBusinessType())) hasSalon = true;
            
            Staff staff = staffRepository.findByIdForUpdate(itemDto.getStaffId())
                    .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

            // Check if staff can perform this service
            if (!staff.getServices().contains(service)) {
                throw new BadRequestException("Staff " + staff.getUser().getFirstName() + " cannot perform service " + service.getName());
            }

            LocalDateTime endTime = currentStartTime.plusMinutes(service.getDurationMins());

            // Conflict detection engine (against existing DB records)
            List<AppointmentItem> conflicts = appointmentItemRepository.findOverlappingAppointments(
                    staff.getId(), currentStartTime, endTime);
            
            if (!conflicts.isEmpty()) {
                throw new ConflictException("Double booking detected for staff " + staff.getUser().getFirstName() + " at " + currentStartTime);
            }

            AppointmentItem item = new AppointmentItem();
            item.setAppointment(appointment);
            item.setService(service);
            item.setStaff(staff);
            item.setStartTime(currentStartTime);
            item.setEndTime(endTime);
            item.setPrice(service.getPrice()); // Snapshot the price

            totalPrice = totalPrice.add(service.getPrice());
            appointment.getServices().add(item);
            
            currentStartTime = endTime; // Sequence next service
        }

        appointment.setTotalPrice(totalPrice);
        
        if (hasSpa && hasSalon) {
            appointment.setBusinessType("BOTH");
        } else if (hasSpa) {
            appointment.setBusinessType("SPA");
        } else if (hasSalon) {
            appointment.setBusinessType("SALON");
        } else {
            appointment.setBusinessType("BOTH");
        }
        
        Appointment savedAppointment = appointmentRepository.save(appointment);
        
        // Emit SSE event
        sseService.sendEventToAll("appointment_booked", savedAppointment.getId());
        
        return mapToDto(savedAppointment);
    }

    @Transactional(readOnly = true)
    public com.luxesuite.api.dto.PageResponse<AppointmentDto> getAppointmentsByBranchAndDateRange(Long branchId, LocalDateTime start, LocalDateTime end, int page, int size, String businessType) {
        securityUtils.validateBranchAccess(branchId);
        String bType = businessType != null ? businessType : "BOTH";
        List<String> validTypes = "BOTH".equals(bType) ? java.util.Arrays.asList("SPA", "SALON", "BOTH") : java.util.Arrays.asList("BOTH", bType);
        org.springframework.data.domain.Page<Appointment> appointments = appointmentRepository.findByBranchIdAndCreatedAtBetweenAndBusinessTypeIn(branchId, start, end, validTypes, org.springframework.data.domain.PageRequest.of(page, size));
        
        if (appointments.hasContent()) {
            List<Long> appointmentIds = appointments.stream().map(Appointment::getId).collect(Collectors.toList());
            // Pre-fetch items with service and staff to avoid N+1 during mapToDto
            List<AppointmentItem> items = appointmentItemRepository.findByAppointmentIdIn(appointmentIds);
            
            // Group the pre-fetched items back into their respective appointments
            java.util.Map<Long, List<AppointmentItem>> itemsByAppointment = items.stream()
                .collect(Collectors.groupingBy(item -> item.getAppointment().getId()));
                
            appointments.forEach(app -> {
                app.setServices(itemsByAppointment.getOrDefault(app.getId(), new java.util.ArrayList<>()));
            });
        }
        
        return com.luxesuite.api.dto.PageResponse.of(appointments.map(this::mapToDto));
    }

    @Transactional(readOnly = true)
    public List<AppointmentDto> getAppointmentsByStaffAndDate(Long staffId, LocalDateTime startOfDay, LocalDateTime endOfDay) {
        // Here we could validate staff access if needed
        List<Appointment> appointments = appointmentRepository.findAppointmentsByStaffAndDate(staffId, startOfDay, endOfDay);
        return appointments.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public AppointmentDto completeAppointment(Long appointmentId, List<com.luxesuite.api.dto.ProductUsageDto> usedProducts) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        
        appointment.setStatus(AppointmentStatus.COMPLETED);
        
        for (AppointmentItem item : appointment.getServices()) {
            item.setStatus(AppointmentStatus.COMPLETED);
        }
        
        if (usedProducts != null) {
            for (com.luxesuite.api.dto.ProductUsageDto usage : usedProducts) {
                // Deduct stock (negative quantity adjustment)
                inventoryService.updateStock(usage.getProductId(), appointment.getBranch().getId(), -usage.getQuantity());
            }
        }
        
        Appointment savedAppointment = appointmentRepository.save(appointment);
        
        // Emit SSE event
        sseService.sendEventToAll("appointment_updated", savedAppointment.getId());
        
        return mapToDto(savedAppointment);
    }

    private AppointmentDto mapToDto(Appointment appointment) {
        AppointmentDto dto = new AppointmentDto();
        dto.setId(appointment.getId());
        dto.setCustomerId(appointment.getCustomer().getId());
        dto.setBranchId(appointment.getBranch().getId());
        dto.setStatus(appointment.getStatus());
        dto.setTotalPrice(appointment.getTotalPrice());
        dto.setNotes(appointment.getNotes());
        dto.setCreatedAt(appointment.getCreatedAt());
        dto.setBusinessType(appointment.getBusinessType());
        
        List<AppointmentItemDto> itemDtos = appointment.getServices().stream().map(item -> {
            AppointmentItemDto itemDto = new AppointmentItemDto();
            itemDto.setId(item.getId());
            itemDto.setServiceId(item.getService().getId());
            itemDto.setStaffId(item.getStaff().getId());
            itemDto.setStartTime(item.getStartTime());
            itemDto.setEndTime(item.getEndTime());
            itemDto.setStatus(item.getStatus());
            itemDto.setPrice(item.getPrice());
            return itemDto;
        }).collect(Collectors.toList());
        
        dto.setServices(itemDtos);
        return dto;
    }
}
