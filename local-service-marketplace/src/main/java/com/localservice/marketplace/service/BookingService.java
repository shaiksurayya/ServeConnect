package com.localservice.marketplace.service;

import com.localservice.marketplace.dto.request.BookingRequestDTO;
import com.localservice.marketplace.dto.request.RescheduleRequestDTO;
import com.localservice.marketplace.dto.response.BookingResponseDTO;
import com.localservice.marketplace.enums.BookingStatus;

import java.util.List;

public interface BookingService {

    BookingResponseDTO createBooking(
            BookingRequestDTO request,
            String customerEmail
    );

    BookingResponseDTO rescheduleBooking(
            Long bookingId,
            RescheduleRequestDTO request,
            String customerEmail
    );

    BookingResponseDTO cancelBookingCustomer(
            Long bookingId,
            String customerEmail
    );

    List<BookingResponseDTO> getAllBookings();

    BookingResponseDTO getBookingById(Long bookingId);

    List<BookingResponseDTO> getMyBookingsCustomer(
            String customerEmail
    );

    List<BookingResponseDTO> getMyBookingsProvider(
            String providerEmail
    );

    List<BookingResponseDTO> getBookingsByStatus(
            BookingStatus status
    );

    BookingResponseDTO updateBookingStatus(
            Long bookingId,
            BookingStatus status,
            String providerEmail
    );

    BookingResponseDTO rejectBooking(
            Long bookingId,
            String providerEmail
    );

    void deleteBooking(
            Long bookingId,
            String customerEmail
    );
}
