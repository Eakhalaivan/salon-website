package com.luxesuite.api.controller;

import com.luxesuite.api.dto.CmsContentBlockDto;
import com.luxesuite.api.service.CmsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/cms")
@RequiredArgsConstructor
public class CmsController {

    private final CmsService cmsService;

    @GetMapping("/{pageKey}")
    public ResponseEntity<List<CmsContentBlockDto>> getPageContent(@PathVariable String pageKey) {
        return ResponseEntity.ok(cmsService.getPageContent(pageKey));
    }

    @PutMapping("/{pageKey}/{blockKey}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<CmsContentBlockDto> updateBlockContent(
            @PathVariable String pageKey,
            @PathVariable String blockKey,
            @RequestBody Map<String, String> payload) {
        
        String contentValue = payload.get("contentValue");
        return ResponseEntity.ok(cmsService.updateBlockContent(pageKey, blockKey, contentValue));
    }
}
