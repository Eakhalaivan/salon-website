package com.luxesuite.api.service;

import com.luxesuite.api.dto.BranchComparisonDto;
import com.luxesuite.api.model.Branch;
import com.luxesuite.api.repository.AppointmentRepository;
import com.luxesuite.api.repository.BranchRepository;
import com.luxesuite.api.repository.InvoiceRepository;
import com.luxesuite.api.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class BranchComparisonTest {

    @Mock
    private BranchRepository branchRepository;
    
    @Mock
    private InvoiceRepository invoiceRepository;
    
    @Mock
    private AppointmentRepository appointmentRepository;
    
    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private BranchService branchService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void testCompareBranches_CalculatesCorrectly() {
        Branch b1 = new Branch();
        b1.setId(1L);
        b1.setName("Branch 1");

        Branch b2 = new Branch();
        b2.setId(2L);
        b2.setName("Branch 2");

        when(branchRepository.findById(1L)).thenReturn(Optional.of(b1));
        when(branchRepository.findById(2L)).thenReturn(Optional.of(b2));

        when(invoiceRepository.getTotalRevenueByBranchId(1L)).thenReturn(1000.50);
        when(appointmentRepository.countByBranchId(1L)).thenReturn(15L);
        when(reviewRepository.getAverageRatingByBranchId(1L)).thenReturn(4.8);

        when(invoiceRepository.getTotalRevenueByBranchId(2L)).thenReturn(2500.00);
        when(appointmentRepository.countByBranchId(2L)).thenReturn(30L);
        when(reviewRepository.getAverageRatingByBranchId(2L)).thenReturn(4.2);

        BranchComparisonDto result = branchService.compareBranches(1L, 2L);

        assertEquals(1L, result.getBranch1().getBranchId());
        assertEquals(1000.50, result.getBranch1().getTotalRevenue());
        assertEquals(15L, result.getBranch1().getAppointmentCount());
        assertEquals(4.8, result.getBranch1().getAverageRating());

        assertEquals(2L, result.getBranch2().getBranchId());
        assertEquals(2500.00, result.getBranch2().getTotalRevenue());
        assertEquals(30L, result.getBranch2().getAppointmentCount());
        assertEquals(4.2, result.getBranch2().getAverageRating());
    }

    @Test
    void testCompareBranches_HandlesNullValues() {
        Branch b1 = new Branch();
        b1.setId(1L);
        b1.setName("Branch 1");

        Branch b2 = new Branch();
        b2.setId(2L);
        b2.setName("Branch 2");

        when(branchRepository.findById(1L)).thenReturn(Optional.of(b1));
        when(branchRepository.findById(2L)).thenReturn(Optional.of(b2));

        when(invoiceRepository.getTotalRevenueByBranchId(anyLong())).thenReturn(null);
        when(appointmentRepository.countByBranchId(anyLong())).thenReturn(0L); // primitive return
        when(reviewRepository.getAverageRatingByBranchId(anyLong())).thenReturn(null);

        BranchComparisonDto result = branchService.compareBranches(1L, 2L);

        assertEquals(1L, result.getBranch1().getBranchId());
        assertEquals(0.0, result.getBranch1().getTotalRevenue());
        assertEquals(0L, result.getBranch1().getAppointmentCount());
        assertEquals(0.0, result.getBranch1().getAverageRating());
    }
}
