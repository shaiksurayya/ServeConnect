package com.localservice.marketplace.repository;

import com.localservice.marketplace.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProvider_ProviderId(Long providerId);

    List<Review> findByCustomer_UserId(Long customerId);

    List<Review> findByBooking_BookingId(Long bookingId);

    // Reviews belonging to a particular service
    List<Review> findByBooking_Service_ServiceId(Long serviceId);

    Optional<Review> findFirstByBooking_BookingId(Long bookingId);

    boolean existsByBooking_BookingId(Long bookingId);
}