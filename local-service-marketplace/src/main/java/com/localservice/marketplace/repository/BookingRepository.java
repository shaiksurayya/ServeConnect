package com.localservice.marketplace.repository;

import com.localservice.marketplace.entity.Booking;
import com.localservice.marketplace.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomer_UserId(Long customerId);

    List<Booking> findByProvider_ProviderId(Long providerId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByService_ServiceId(Long serviceId);

    /*
     * Checks whether the provider already has an active
     * booking for the selected date and time.
     *
     * REQUESTED, ACCEPTED and IN_PROGRESS block the slot.
     * COMPLETED, CANCELLED and REJECTED do not block it.
     */
    boolean existsByProvider_ProviderIdAndBookingDateAndBookingTimeAndStatusIn(
            Long providerId,
            LocalDate bookingDate,
            LocalTime bookingTime,
            List<BookingStatus> statuses
    );
}