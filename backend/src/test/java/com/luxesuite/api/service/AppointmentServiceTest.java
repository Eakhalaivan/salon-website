package com.luxesuite.api.service;

import com.luxesuite.api.dto.AppointmentDto;
import com.luxesuite.api.dto.AppointmentItemDto;
import com.luxesuite.api.model.*;
import com.luxesuite.api.repository.*;
import com.luxesuite.api.security.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;
    @Mock
    private AppointmentItemRepository appointmentItemRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private BranchRepository branchRepository;
    @Mock
    private ServiceRepository serviceRepository;
    @Mock
    private StaffRepository staffRepository;
    @Mock
    private InventoryService inventoryService;
    @Mock
    private SecurityUtils securityUtils;
    @Mock
    private SseService sseService;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private AppointmentService appointmentService;

    private Customer testCustomer;
    private Branch testBranch;
    private com.luxesuite.api.model.Service testService;
    private Staff testStaff;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setId(100L);
        user.setFirstName("John");
        user.setEmail("john@example.com");

        testCustomer = new Customer();
        testCustomer.setId(1L);
        testCustomer.setUser(user);

        testBranch = new Branch();
        testBranch.setId(2L);

        testService = new com.luxesuite.api.model.Service();
        testService.setId(3L);
        testService.setName("Massage");
        testService.setPrice(new BigDecimal("100.00"));
        testService.setDurationMins(60);
        testService.setBusinessType("SPA");

        testStaff = new Staff();
        testStaff.setId(4L);
        testStaff.setUser(user);
        testStaff.setServices(Collections.singleton(testService));
    }

    @Test
    void createAppointment_Success() {
        AppointmentDto inputDto = new AppointmentDto();
        inputDto.setCustomerId(1L);
        inputDto.setBranchId(2L);
        
        AppointmentItemDto itemDto = new AppointmentItemDto();
        itemDto.setServiceId(3L);
        itemDto.setStaffId(4L);
        itemDto.setStartTime(LocalDateTime.now().plusDays(1));
        
        inputDto.setServices(Collections.singletonList(itemDto));

        when(customerRepository.findById(1L)).thenReturn(Optional.of(testCustomer));
        doNothing().when(securityUtils).validateCustomerOwnership(100L);
        when(branchRepository.findById(2L)).thenReturn(Optional.of(testBranch));
        when(serviceRepository.findById(3L)).thenReturn(Optional.of(testService));
        when(staffRepository.findByIdForUpdate(4L)).thenReturn(Optional.of(testStaff));
        when(appointmentItemRepository.findOverlappingAppointments(any(), any(), any())).thenReturn(Collections.emptyList());
        
        Appointment savedAppointment = new Appointment();
        savedAppointment.setId(10L);
        savedAppointment.setCustomer(testCustomer);
        savedAppointment.setBranch(testBranch);
        savedAppointment.setTotalPrice(new BigDecimal("100.00"));
        savedAppointment.setBusinessType("SPA");
        
        AppointmentItem savedItem = new AppointmentItem();
        savedItem.setId(20L);
        savedItem.setService(testService);
        savedItem.setStaff(testStaff);
        savedItem.setPrice(new BigDecimal("100.00"));
        savedItem.setAppointment(savedAppointment);
        
        savedAppointment.getServices().add(savedItem);
        
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(savedAppointment);
        doNothing().when(sseService).sendEventToAll(anyString(), anyLong());

        AppointmentDto result = appointmentService.createAppointment(inputDto);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertEquals(new BigDecimal("100.00"), result.getTotalPrice());
        assertEquals("SPA", result.getBusinessType());
        assertEquals(1, result.getServices().size());
        
        verify(appointmentRepository).save(any(Appointment.class));
        verify(sseService).sendEventToAll("appointment_booked", 10L);
        verify(emailService).sendEmail(eq("john@example.com"), anyString(), anyString());
    }

    @Test
    void completeAppointment_Success() {
        Appointment appointment = new Appointment();
        appointment.setId(10L);
        appointment.setBranch(testBranch);
        
        AppointmentItem item = new AppointmentItem();
        item.setService(testService);
        item.setStaff(testStaff);
        appointment.getServices().add(item);

        when(appointmentRepository.findById(10L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);
        doNothing().when(sseService).sendEventToAll(anyString(), anyLong());

        AppointmentDto result = appointmentService.completeAppointment(10L, null);

        assertNotNull(result);
        assertEquals(AppointmentStatus.COMPLETED, result.getStatus());
        
        verify(appointmentRepository).save(appointment);
        verify(sseService).sendEventToAll("appointment_updated", 10L);
    }
}
