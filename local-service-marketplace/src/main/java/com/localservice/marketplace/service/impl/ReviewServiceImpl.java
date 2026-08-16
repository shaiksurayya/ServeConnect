package com.localservice.marketplace.service.impl;

import com.localservice.marketplace.dto.request.ReviewRequestDTO;
import com.localservice.marketplace.dto.response.ReviewResponseDTO;
import com.localservice.marketplace.entity.Booking;
import com.localservice.marketplace.entity.ProviderProfile;
import com.localservice.marketplace.entity.Review;
import com.localservice.marketplace.entity.User;
import com.localservice.marketplace.repository.BookingRepository;
import com.localservice.marketplace.repository.ProviderProfileRepository;
import com.localservice.marketplace.repository.ReviewRepository;
import com.localservice.marketplace.repository.UserRepository;
import com.localservice.marketplace.service.ReviewService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ProviderProfileRepository providerProfileRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository,
                              BookingRepository bookingRepository,
                              UserRepository userRepository,
                              ProviderProfileRepository providerProfileRepository) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.providerProfileRepository = providerProfileRepository;
    }

    @Override
    public ReviewResponseDTO createReview(ReviewRequestDTO reviewRequestDTO, String customerEmail) {

        Booking booking = bookingRepository.findById(reviewRequestDTO.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + reviewRequestDTO.getBookingId()));

        if (!booking.getCustomer().getEmail().equals(customerEmail)) {
            throw new RuntimeException("You are not authorized to review this booking");
        }
        
        if (booking.getStatus() != com.localservice.marketplace.enums.BookingStatus.COMPLETED) {
            throw new RuntimeException("You can only review completed bookings");
        }

        if (reviewRepository.existsByBooking_BookingId(booking.getBookingId())) {
            throw new RuntimeException("This booking has already been reviewed");
        }

        User customer = booking.getCustomer();
        ProviderProfile provider = booking.getProvider();

        Review review = Review.builder()
                .booking(booking)
                .customer(customer)
                .provider(provider)
                .rating(reviewRequestDTO.getRating())
                .comment(reviewRequestDTO.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);

        // Update Provider average rating
        List<Review> providerReviews = reviewRepository.findByProvider_ProviderId(provider.getProviderId());
        double avg = providerReviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        provider.setAvgRating(java.math.BigDecimal.valueOf(avg));
        providerProfileRepository.save(provider);

        return mapToResponseDTO(savedReview);
    }

    @Override
    public List<ReviewResponseDTO> getAllReviews() {
        return reviewRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ReviewResponseDTO getReviewById(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + reviewId));
        return mapToResponseDTO(review);
    }

    @Override
    public List<ReviewResponseDTO> getReviewsByProvider(Long providerId) {
        return reviewRepository.findByProvider_ProviderId(providerId)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewResponseDTO> getReviewsByCustomer(Long customerId) {
        return reviewRepository.findByCustomer_UserId(customerId)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
public List<ReviewResponseDTO> getReviewsByService(Long serviceId) {

    return reviewRepository
            .findByBooking_Service_ServiceId(serviceId)
            .stream()
            .map(this::mapToResponseDTO)
            .collect(Collectors.toList());
}

    @Override
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + reviewId));
        reviewRepository.delete(review);
    }

    private ReviewResponseDTO mapToResponseDTO(Review review) {
        return ReviewResponseDTO.builder()
                .reviewId(review.getReviewId())
                .bookingId(review.getBooking().getBookingId())
                .customerId(review.getCustomer().getUserId())
                .customerName(review.getCustomer().getName())
                .providerId(review.getProvider().getProviderId())
                .providerName(review.getProvider().getUser().getName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }

    
}