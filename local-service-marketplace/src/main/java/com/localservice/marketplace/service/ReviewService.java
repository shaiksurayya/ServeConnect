package com.localservice.marketplace.service;

import com.localservice.marketplace.dto.request.ReviewRequestDTO;
import com.localservice.marketplace.dto.response.ReviewResponseDTO;

import java.util.List;

public interface ReviewService {

    ReviewResponseDTO createReview(ReviewRequestDTO reviewRequestDTO, String customerEmail);

    List<ReviewResponseDTO> getAllReviews();

    ReviewResponseDTO getReviewById(Long reviewId);

    List<ReviewResponseDTO> getReviewsByProvider(Long providerId);

    List<ReviewResponseDTO> getReviewsByCustomer(Long customerId);

    void deleteReview(Long reviewId);
    List<ReviewResponseDTO> getReviewsByService(Long serviceId);
}