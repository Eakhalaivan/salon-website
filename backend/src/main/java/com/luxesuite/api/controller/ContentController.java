package com.luxesuite.api.controller;

import com.luxesuite.api.dto.BlogPostDto;
import com.luxesuite.api.dto.JobOpeningDto;
import com.luxesuite.api.dto.PageResponse;
import com.luxesuite.api.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/content")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    @GetMapping("/blog")
    public ResponseEntity<PageResponse<BlogPostDto>> getPublishedBlogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(contentService.getPublishedBlogs(page, size));
    }

    @GetMapping("/blog/{slug}")
    public ResponseEntity<BlogPostDto> getBlogBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(contentService.getBlogBySlug(slug));
    }

    @PostMapping("/blog")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BlogPostDto> createBlog(@RequestBody BlogPostDto dto) {
        return ResponseEntity.ok(contentService.createBlogPost(dto));
    }

    @PutMapping("/blog/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BlogPostDto> updateBlog(@PathVariable Long id, @RequestBody BlogPostDto dto) {
        return ResponseEntity.ok(contentService.updateBlogPost(id, dto));
    }

    @GetMapping("/careers")
    public ResponseEntity<PageResponse<JobOpeningDto>> getActiveJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(contentService.getActiveJobOpenings(page, size));
    }

    @PostMapping("/careers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<JobOpeningDto> createJob(@RequestBody JobOpeningDto dto) {
        return ResponseEntity.ok(contentService.createJobOpening(dto));
    }

    @PutMapping("/careers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<JobOpeningDto> updateJob(@PathVariable Long id, @RequestBody JobOpeningDto dto) {
        return ResponseEntity.ok(contentService.updateJobOpening(id, dto));
    }
}
