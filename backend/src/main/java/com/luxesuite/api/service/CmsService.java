package com.luxesuite.api.service;

import com.luxesuite.api.dto.CmsContentBlockDto;
import com.luxesuite.api.exception.ResourceNotFoundException;
import com.luxesuite.api.model.CmsContentBlock;
import com.luxesuite.api.model.User;
import com.luxesuite.api.repository.CmsContentBlockRepository;
import com.luxesuite.api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CmsService {

    private final CmsContentBlockRepository cmsRepository;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public List<CmsContentBlockDto> getPageContent(String pageKey) {
        return cmsRepository.findByPageKey(pageKey).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CmsContentBlockDto updateBlockContent(String pageKey, String blockKey, String contentValue) {
        CmsContentBlock block = cmsRepository.findByPageKeyAndBlockKey(pageKey, blockKey)
                .orElseThrow(() -> new ResourceNotFoundException("CMS Block not found for page: " + pageKey + " and block: " + blockKey));

        User currentUser = securityUtils.getCurrentUser();
        
        block.setContentValue(contentValue);
        block.setUpdatedBy(currentUser);
        
        CmsContentBlock saved = cmsRepository.save(block);
        return mapToDto(saved);
    }

    private CmsContentBlockDto mapToDto(CmsContentBlock block) {
        return CmsContentBlockDto.builder()
                .id(block.getId())
                .pageKey(block.getPageKey())
                .blockKey(block.getBlockKey())
                .contentType(block.getContentType())
                .contentValue(block.getContentValue())
                .updatedBy(block.getUpdatedBy() != null ? block.getUpdatedBy().getId() : null)
                .updatedAt(block.getUpdatedAt())
                .build();
    }
}
