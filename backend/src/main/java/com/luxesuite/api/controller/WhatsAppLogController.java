package com.luxesuite.api.controller;

import com.luxesuite.api.dto.PageResponse;
import com.luxesuite.api.dto.WhatsAppMessageLogDto;
import com.luxesuite.api.model.WhatsAppMessageLog;
import com.luxesuite.api.repository.WhatsAppMessageLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/notifications/whatsapp-log")
@RequiredArgsConstructor
public class WhatsAppLogController {

    private final WhatsAppMessageLogRepository logRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PageResponse<WhatsAppMessageLogDto>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<WhatsAppMessageLog> logPage = logRepository.findAll(pageable);
        
        List<WhatsAppMessageLogDto> content = logPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
                
        PageResponse<WhatsAppMessageLogDto> response = new PageResponse<>(
                content,
                logPage.getNumber(),
                logPage.getSize(),
                logPage.getTotalElements(),
                logPage.getTotalPages(),
                logPage.isLast()
        );
        
        return ResponseEntity.ok(response);
    }

    private WhatsAppMessageLogDto mapToDto(WhatsAppMessageLog logEntry) {
        String customerName = null;
        if (logEntry.getCustomer() != null) {
            customerName = logEntry.getCustomer().getFirstName();
            if (logEntry.getCustomer().getLastName() != null) {
                customerName += " " + logEntry.getCustomer().getLastName();
            }
        }
        
        return WhatsAppMessageLogDto.builder()
                .id(logEntry.getId())
                .customerId(logEntry.getCustomer() != null ? logEntry.getCustomer().getId() : null)
                .customerName(customerName)
                .phoneNumber(logEntry.getPhoneNumber())
                .templateName(logEntry.getTemplateName())
                .status(logEntry.getStatus())
                .relatedEntityType(logEntry.getRelatedEntityType())
                .relatedEntityId(logEntry.getRelatedEntityId())
                .createdAt(logEntry.getCreatedAt())
                .build();
    }
}
