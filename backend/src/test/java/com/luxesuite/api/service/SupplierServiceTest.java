package com.luxesuite.api.service;

import com.luxesuite.api.dto.SupplierDto;
import com.luxesuite.api.model.Supplier;
import com.luxesuite.api.repository.SupplierRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SupplierServiceTest {

    @Mock
    private SupplierRepository supplierRepository;

    @InjectMocks
    private SupplierService supplierService;

    private Supplier supplier;

    @BeforeEach
    void setUp() {
        supplier = new Supplier();
        supplier.setId(1L);
        supplier.setName("Beauty Co");
        supplier.setContactEmail("jane@beauty.co");
        supplier.setContactPhone("1234567890");
    }

    @Test
    void testCreateSupplier() {
        when(supplierRepository.save(any(Supplier.class))).thenReturn(supplier);

        SupplierDto dto = new SupplierDto();
        dto.setName("Beauty Co");
        dto.setContactEmail("jane@beauty.co");
        dto.setContactPhone("1234567890");

        SupplierDto result = supplierService.createSupplier(dto);
        assertNotNull(result);
        assertEquals("jane@beauty.co", result.getContactEmail());
    }
}
