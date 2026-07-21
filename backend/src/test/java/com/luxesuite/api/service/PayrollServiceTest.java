package com.luxesuite.api.service;

import com.luxesuite.api.model.*;
import com.luxesuite.api.repository.CommissionEarningRepository;
import com.luxesuite.api.repository.PayrollRecordRepository;
import com.luxesuite.api.repository.StaffCommissionRuleRepository;
import com.luxesuite.api.repository.StaffRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PayrollServiceTest {

    @Mock
    private StaffRepository staffRepository;

    @Mock
    private CommissionEarningRepository commissionEarningRepository;

    @Mock
    private PayrollRecordRepository payrollRecordRepository;

    @Mock
    private StaffCommissionRuleRepository ruleRepository;

    @InjectMocks
    private PayrollService payrollService;

    private Staff staff;
    private Service service;
    private AppointmentItem appointmentItem;
    private Appointment appointment;
    private Invoice invoice;

    @BeforeEach
    void setUp() {
        staff = Staff.builder()
                .id(1L)
                .commissionRate(new BigDecimal("10.00")) // 10%
                .build();

        service = new Service();
        service.setId(10L);

        appointment = Appointment.builder().id(100L).build();

        appointmentItem = AppointmentItem.builder()
                .id(50L)
                .staff(staff)
                .service(service)
                .price(new BigDecimal("150.00"))
                .appointment(appointment)
                .build();
                
        appointment.setServices(List.of(appointmentItem));

        invoice = Invoice.builder()
                .id(200L)
                .appointment(appointment)
                .build();
    }

    @Test
    void calculateCommissions_withSpecificRule() {
        // Arrange
        StaffCommissionRule rule = StaffCommissionRule.builder()
                .commissionType("PERCENTAGE")
                .commissionValue(new BigDecimal("15.00")) // 15% override
                .service(service)
                .build();
        
        when(ruleRepository.findByStaffId(staff.getId(), PageRequest.of(0, 100)))
                .thenReturn(new PageImpl<>(List.of(rule)));

        // Act
        payrollService.calculateCommissions(invoice);

        // Assert
        ArgumentCaptor<CommissionEarning> captor = ArgumentCaptor.forClass(CommissionEarning.class);
        verify(commissionEarningRepository).save(captor.capture());

        CommissionEarning saved = captor.getValue();
        assertEquals(staff, saved.getStaff());
        
        // 15% of 150 = 22.50
        assertEquals(new BigDecimal("22.50"), saved.getAmount());
        assertEquals(invoice, saved.getInvoice());
    }

    @Test
    void calculateCommissions_withDefaultRate() {
        // Arrange
        when(ruleRepository.findByStaffId(staff.getId(), PageRequest.of(0, 100)))
                .thenReturn(new PageImpl<>(List.of())); // No specific rule

        // Act
        payrollService.calculateCommissions(invoice);

        // Assert
        ArgumentCaptor<CommissionEarning> captor = ArgumentCaptor.forClass(CommissionEarning.class);
        verify(commissionEarningRepository).save(captor.capture());

        CommissionEarning saved = captor.getValue();
        
        // 10% of 150 = 15.00
        assertEquals(new BigDecimal("15.00"), saved.getAmount());
    }
}
