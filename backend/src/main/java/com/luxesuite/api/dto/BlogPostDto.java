package com.luxesuite.api.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BlogPostDto {
    private Long id;
    private String title;
    private String slug;
    private String excerpt;
    private String content;
    private String coverImageUrl;
    private String author;
    private LocalDateTime publishedAt;
    private String status;
}
