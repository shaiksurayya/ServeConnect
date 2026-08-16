package com.localservice.marketplace.controller;

import com.localservice.marketplace.dto.request.BookingRequestDTO;
import com.localservice.marketplace.dto.response.BookingResponseDTO;
import com.localservice.marketplace.enums.BookingStatus;
import com.localservice.marketplace.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/customer")
    public ResponseEntity<BookingResponseDTO> createBooking(
            @Valid @RequestBody BookingRequestDTO request,
            org.springframework.security.core.Authentication authentication) {

        BookingResponseDTO response =
                bookingService.createBooking(request, authentication.getName());

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {

        List<BookingResponseDTO> responses =
                bookingService.getAllBookings();

        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingResponseDTO> getBookingById(
            @PathVariable Long bookingId) {

        BookingResponseDTO response =
                bookingService.getBookingById(bookingId);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/customer")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookingsCustomer(
            org.springframework.security.core.Authentication authentication) {

        List<BookingResponseDTO> responses =
                bookingService.getMyBookingsCustomer(authentication.getName());

        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

    @GetMapping("/provider")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookingsProvider(
            org.springframework.security.core.Authentication authentication) {

        List<BookingResponseDTO> responses =
                bookingService.getMyBookingsProvider(authentication.getName());

        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<BookingResponseDTO>> getBookingsByStatus(
            @PathVariable BookingStatus status) {

        List<BookingResponseDTO> responses =
                bookingService.getBookingsByStatus(status);

        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

    /*
     * Existing status endpoint.
     *
     * This keeps the currently working Accept and Complete functionality.
     */
    @PutMapping("/provider/{bookingId}/status")
    public ResponseEntity<BookingResponseDTO> updateBookingStatus(
            @PathVariable Long bookingId,
            @RequestParam BookingStatus status,
            org.springframework.security.core.Authentication authentication) {

        BookingResponseDTO response =
                bookingService.updateBookingStatus(
                        bookingId,
                        status,
                        authentication.getName()
                );

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /*
     * Dedicated Reject endpoint.
     *
     * Frontend:
     * PUT /api/bookings/{bookingId}/reject
     */
    @PutMapping("/{bookingId}/reject")
    public ResponseEntity<BookingResponseDTO> rejectBooking(
            @PathVariable Long bookingId,
            org.springframework.security.core.Authentication authentication) {

        BookingResponseDTO response =
                bookingService.rejectBooking(
                        bookingId,
                        authentication.getName()
                );

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/customer/{bookingId}")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable Long bookingId,
            org.springframework.security.core.Authentication authentication) {

        bookingService.deleteBooking(
                bookingId,
                authentication.getName()
        );

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}