package com.luxesuite.api.service;

import com.luxesuite.api.dto.BlogPostDto;
import com.luxesuite.api.dto.JobOpeningDto;
import com.luxesuite.api.dto.PageResponse;
import com.luxesuite.api.model.BlogPost;
import com.luxesuite.api.model.JobOpening;
import com.luxesuite.api.repository.BlogPostRepository;
import com.luxesuite.api.repository.JobOpeningRepository;
import com.luxesuite.api.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ContentService {

    private final BlogPostRepository blogPostRepository;
    private final JobOpeningRepository jobOpeningRepository;

    @org.springframework.cache.annotation.Cacheable(value = "content", key = "'blogs_' + #page + '_' + #size")
    public PageResponse<BlogPostDto> getPublishedBlogs(int page, int size) {
        Page<BlogPost> posts = blogPostRepository.findByStatus("PUBLISHED", PageRequest.of(page, size));
        return PageResponse.of(posts.map(this::mapToDto));
    }

    @org.springframework.cache.annotation.Cacheable(value = "content", key = "'blog_' + #slug")
    public BlogPostDto getBlogBySlug(String slug) {
        BlogPost post = blogPostRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post not found"));
        return mapToDto(post);
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "content", allEntries = true)
    public BlogPostDto createBlogPost(BlogPostDto dto) {
        BlogPost post = BlogPost.builder()
                .title(dto.getTitle())
                .slug(dto.getSlug())
                .excerpt(dto.getExcerpt())
                .content(dto.getContent())
                .coverImageUrl(dto.getCoverImageUrl())
                .author(dto.getAuthor())
                .status(dto.getStatus())
                .publishedAt("PUBLISHED".equals(dto.getStatus()) ? LocalDateTime.now() : null)
                .build();
        return mapToDto(blogPostRepository.save(post));
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "content", allEntries = true)
    public BlogPostDto updateBlogPost(Long id, BlogPostDto dto) {
        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post not found"));
                
        post.setTitle(dto.getTitle());
        post.setSlug(dto.getSlug());
        post.setExcerpt(dto.getExcerpt());
        post.setContent(dto.getContent());
        post.setCoverImageUrl(dto.getCoverImageUrl());
        post.setAuthor(dto.getAuthor());
        if (!"PUBLISHED".equals(post.getStatus()) && "PUBLISHED".equals(dto.getStatus())) {
            post.setPublishedAt(LocalDateTime.now());
        }
        post.setStatus(dto.getStatus());
        
        return mapToDto(blogPostRepository.save(post));
    }

    @org.springframework.cache.annotation.Cacheable(value = "content", key = "'jobs_' + #page + '_' + #size")
    public PageResponse<JobOpeningDto> getActiveJobOpenings(int page, int size) {
        Page<JobOpening> jobs = jobOpeningRepository.findByActive(true, PageRequest.of(page, size));
        return PageResponse.of(jobs.map(this::mapToJobDto));
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "content", allEntries = true)
    public JobOpeningDto createJobOpening(JobOpeningDto dto) {
        JobOpening job = JobOpening.builder()
                .title(dto.getTitle())
                .department(dto.getDepartment())
                .location(dto.getLocation())
                .description(dto.getDescription())
                .employmentType(dto.getEmploymentType())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();
        return mapToJobDto(jobOpeningRepository.save(job));
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "content", allEntries = true)
    public JobOpeningDto updateJobOpening(Long id, JobOpeningDto dto) {
        JobOpening job = jobOpeningRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job opening not found"));
                
        job.setTitle(dto.getTitle());
        job.setDepartment(dto.getDepartment());
        job.setLocation(dto.getLocation());
        job.setDescription(dto.getDescription());
        job.setEmploymentType(dto.getEmploymentType());
        if (dto.getActive() != null) job.setActive(dto.getActive());
        
        return mapToJobDto(jobOpeningRepository.save(job));
    }

    private BlogPostDto mapToDto(BlogPost post) {
        BlogPostDto dto = new BlogPostDto();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setSlug(post.getSlug());
        dto.setExcerpt(post.getExcerpt());
        dto.setContent(post.getContent());
        dto.setCoverImageUrl(post.getCoverImageUrl());
        dto.setAuthor(post.getAuthor());
        dto.setPublishedAt(post.getPublishedAt());
        dto.setStatus(post.getStatus());
        return dto;
    }
    
    private JobOpeningDto mapToJobDto(JobOpening job) {
        JobOpeningDto dto = new JobOpeningDto();
        dto.setId(job.getId());
        dto.setTitle(job.getTitle());
        dto.setDepartment(job.getDepartment());
        dto.setLocation(job.getLocation());
        dto.setDescription(job.getDescription());
        dto.setEmploymentType(job.getEmploymentType());
        dto.setActive(job.getActive());
        return dto;
    }
}
