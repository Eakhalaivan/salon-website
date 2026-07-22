package com.luxesuite.api.service;

import com.luxesuite.api.dto.ServiceDto;
import com.luxesuite.api.model.Service;
import com.luxesuite.api.repository.ServiceRepository;
import com.luxesuite.api.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import com.luxesuite.api.dto.PageResponse;

import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class SalonServiceService {

    private final ServiceRepository serviceRepository;

    @org.springframework.cache.annotation.Cacheable(value = "services", key = "'all_' + #page + '_' + #size")
    public PageResponse<ServiceDto> getAllServices(int page, int size) {
        Page<Service> servicePage = serviceRepository.findAll(PageRequest.of(page, size));
        return PageResponse.of(servicePage.map(this::mapToDto));
    }

    @org.springframework.cache.annotation.Cacheable(value = "services", key = "'active_' + #page + '_' + #size")
    public PageResponse<ServiceDto> getActiveServices(int page, int size) {
        Page<Service> servicePage = serviceRepository.findByIsActiveTrue(PageRequest.of(page, size));
        return PageResponse.of(servicePage.map(this::mapToDto));
    }

    @org.springframework.cache.annotation.Cacheable(value = "services", key = "#id")
    public ServiceDto getServiceById(Long id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        return mapToDto(service);
    }

    @org.springframework.cache.annotation.CacheEvict(value = "services", allEntries = true)
    public ServiceDto createService(ServiceDto dto) {
        Service service = mapToEntity(dto);
        return mapToDto(serviceRepository.save(service));
    }

    @org.springframework.cache.annotation.CacheEvict(value = "services", allEntries = true)
    public ServiceDto updateService(Long id, ServiceDto dto) {
        Service existing = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        
        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setDurationMins(dto.getDurationMins());
        existing.setPrice(dto.getPrice());
        if (dto.getIsActive() != null) {
            existing.setIsActive(dto.getIsActive());
        }
        if (dto.getGenderCategory() != null) {
            existing.setGenderCategory(dto.getGenderCategory());
        }
        if (dto.getCategory() != null) {
            existing.setCategory(dto.getCategory());
        }
        
        return mapToDto(serviceRepository.save(existing));
    }

    @org.springframework.cache.annotation.CacheEvict(value = "services", allEntries = true)
    public void deleteService(Long id) {
        Service existing = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        existing.setIsActive(false);
        serviceRepository.save(existing);
    }

    private ServiceDto mapToDto(Service service) {
        ServiceDto dto = new ServiceDto();
        dto.setId(service.getId());
        dto.setName(service.getName());
        dto.setDescription(service.getDescription());
        dto.setDurationMins(service.getDurationMins());
        dto.setPrice(service.getPrice());
        dto.setIsActive(service.getIsActive());
        dto.setGenderCategory(service.getGenderCategory());
        dto.setCategory(service.getCategory());
        return dto;
    }

    private Service mapToEntity(ServiceDto dto) {
        Service service = new Service();
        service.setName(dto.getName());
        service.setDescription(dto.getDescription());
        service.setDurationMins(dto.getDurationMins());
        service.setPrice(dto.getPrice());
        service.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        service.setGenderCategory(dto.getGenderCategory() != null ? dto.getGenderCategory() : "UNISEX");
        service.setCategory(dto.getCategory() != null ? dto.getCategory() : "Wellness");
        return service;
    }
}
