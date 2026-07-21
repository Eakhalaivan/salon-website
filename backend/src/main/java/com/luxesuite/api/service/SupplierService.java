package com.luxesuite.api.service;
import com.luxesuite.api.dto.PageResponse;
import com.luxesuite.api.dto.SupplierDto;
import com.luxesuite.api.exception.ResourceNotFoundException;
import com.luxesuite.api.model.Supplier;
import com.luxesuite.api.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    @Transactional(readOnly = true)
    public PageResponse<SupplierDto> listSuppliers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Supplier> supplierPage = supplierRepository.findAll(pageable);
        return new PageResponse<>(
                supplierPage.getContent().stream().map(this::mapToDto).collect(Collectors.toList()),
                supplierPage.getNumber(),
                supplierPage.getSize(),
                supplierPage.getTotalElements(),
                supplierPage.getTotalPages(),
                supplierPage.isLast()
        );
    }

    @Transactional
    public SupplierDto createSupplier(SupplierDto dto) {
        Supplier supplier = Supplier.builder()
                .name(dto.getName())
                .contactEmail(dto.getContactEmail())
                .contactPhone(dto.getContactPhone())
                .address(dto.getAddress())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();
        return mapToDto(supplierRepository.save(supplier));
    }

    @Transactional
    public SupplierDto updateSupplier(Long id, SupplierDto dto) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));

        supplier.setName(dto.getName());
        supplier.setContactEmail(dto.getContactEmail());
        supplier.setContactPhone(dto.getContactPhone());
        supplier.setAddress(dto.getAddress());
        if (dto.getActive() != null) {
            supplier.setActive(dto.getActive());
        }

        return mapToDto(supplierRepository.save(supplier));
    }

    private SupplierDto mapToDto(Supplier supplier) {
        return SupplierDto.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .contactEmail(supplier.getContactEmail())
                .contactPhone(supplier.getContactPhone())
                .address(supplier.getAddress())
                .active(supplier.getActive())
                .createdAt(supplier.getCreatedAt())
                .build();
    }
}
