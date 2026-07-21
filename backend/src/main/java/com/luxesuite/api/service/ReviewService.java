package com.luxesuite.api.service;

import com.luxesuite.api.dto.PageResponse;
import com.luxesuite.api.dto.ReviewDto;
import com.luxesuite.api.exception.ForbiddenException;
import com.luxesuite.api.exception.ResourceNotFoundException;
import com.luxesuite.api.model.Customer;
import com.luxesuite.api.model.Review;
import com.luxesuite.api.repository.CustomerRepository;
import com.luxesuite.api.repository.ReviewRepository;
import com.luxesuite.api.security.SecurityUtils;
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
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final CustomerRepository customerRepository;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public PageResponse<ReviewDto> getApprovedReviews(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Review> reviewPage = reviewRepository.findByIsApprovedTrue(pageable);
        return new PageResponse<>(
                reviewPage.getContent().stream().map(this::mapToDto).collect(Collectors.toList()),
                reviewPage.getNumber(),
                reviewPage.getSize(),
                reviewPage.getTotalElements(),
                reviewPage.getTotalPages(),
                reviewPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewDto> getAllReviews(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Review> reviewPage = reviewRepository.findAll(pageable);
        return new PageResponse<>(
                reviewPage.getContent().stream().map(this::mapToDto).collect(Collectors.toList()),
                reviewPage.getNumber(),
                reviewPage.getSize(),
                reviewPage.getTotalElements(),
                reviewPage.getTotalPages(),
                reviewPage.isLast()
        );
    }

    @Transactional
    public ReviewDto createReview(ReviewDto dto) {
        // Customer creates review for themselves
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        // Ensure CUSTOMER can only post for themselves
        if (!securityUtils.hasRole("ADMIN") && !securityUtils.hasRole("MANAGER")) {
            if (!securityUtils.isCustomerOwner(customer.getId())) {
                throw new ForbiddenException("You can only post reviews for your own account.");
            }
        }

        Review review = Review.builder()
                .customer(customer)
                .rating(dto.getRating())
                .title(dto.getTitle())
                .body(dto.getBody())
                .isApproved(false) // Needs admin approval by default
                .build();

        return mapToDto(reviewRepository.save(review));
    }

    @Transactional
    public ReviewDto approveReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        review.setIsApproved(true);
        return mapToDto(reviewRepository.save(review));
    }

    @Transactional
    public void deleteReview(Long id) {
        if (!reviewRepository.existsById(id)) {
            throw new ResourceNotFoundException("Review not found");
        }
        reviewRepository.deleteById(id);
    }

    private ReviewDto mapToDto(Review review) {
        String customerName = review.getCustomer().getFirstName();
        if (review.getCustomer().getLastName() != null && !review.getCustomer().getLastName().isEmpty()) {
            customerName += " " + review.getCustomer().getLastName().charAt(0) + ".";
        }

        return ReviewDto.builder()
                .id(review.getId())
                .customerId(review.getCustomer().getId())
                .customerName(customerName)
                .rating(review.getRating())
                .title(review.getTitle())
                .body(review.getBody())
                .isApproved(review.getIsApproved())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
