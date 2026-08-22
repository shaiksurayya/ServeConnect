package com.localservice.marketplace.service.impl;

import com.localservice.marketplace.dto.request.BookingRequestDTO;
import com.localservice.marketplace.dto.request.RescheduleRequestDTO;
import com.localservice.marketplace.dto.response.BookingResponseDTO;
import com.localservice.marketplace.entity.Booking;
import com.localservice.marketplace.entity.ProviderProfile;
import com.localservice.marketplace.entity.User;
import com.localservice.marketplace.enums.BookingStatus;
import com.localservice.marketplace.enums.NotificationType;
import com.localservice.marketplace.repository.BookingRepository;
import com.localservice.marketplace.repository.ProviderProfileRepository;
import com.localservice.marketplace.repository.ServiceRepository;
import com.localservice.marketplace.repository.UserRepository;
import com.localservice.marketplace.service.BookingService;
import com.localservice.marketplace.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final ServiceRepository serviceRepository;
    private final NotificationService notificationService;

    public BookingServiceImpl(
            BookingRepository bookingRepository,
            UserRepository userRepository,
            ProviderProfileRepository providerProfileRepository,
            ServiceRepository serviceRepository,
            NotificationService notificationService) {

        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.serviceRepository = serviceRepository;
        this.notificationService = notificationService;
    }

    @Override
    public BookingResponseDTO createBooking(
            BookingRequestDTO request,
            String customerEmail) {

        if (request.getBookingDate() == null) {
            throw new IllegalArgumentException(
                    "Booking date is required."
            );
        }

        if (request.getBookingTime() == null) {
            throw new IllegalArgumentException(
                    "Booking time is required."
            );
        }

        LocalDateTime bookingDateTime =
                LocalDateTime.of(
                        request.getBookingDate(),
                        request.getBookingTime()
                );

        if (bookingDateTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException(
                    "Booking date and time cannot be in the past."
            );
        }

        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found for email: "
                                        + customerEmail
                        )
                );

        com.localservice.marketplace.entity.Service service =
                serviceRepository.findById(request.getServiceId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Service not found with id: "
                                                + request.getServiceId()
                                )
                        );

        if (Boolean.FALSE.equals(service.getAvailability())) {
            throw new IllegalStateException(
                    "Service is currently unavailable for booking."
            );
        }

        ProviderProfile provider = service.getProvider();

        boolean slotAlreadyBooked =
                bookingRepository
                        .existsByProvider_ProviderIdAndBookingDateAndBookingTimeAndStatusIn(
                                provider.getProviderId(),
                                request.getBookingDate(),
                                request.getBookingTime(),
                                List.of(
                                        BookingStatus.REQUESTED,
                                        BookingStatus.ACCEPTED,
                                        BookingStatus.IN_PROGRESS
                                )
                        );

        if (slotAlreadyBooked) {
            throw new IllegalStateException(
                    "This time slot is already booked. Please select another date or time."
            );
        }

        Booking booking = Booking.builder()
                .customer(customer)
                .provider(provider)
                .service(service)
                .bookingDate(request.getBookingDate())
                .bookingTime(request.getBookingTime())
                .address(request.getAddress())
                .totalAmount(service.getPrice())
                .status(BookingStatus.REQUESTED)
                .paymentMethod("CASH_ON_SERVICE")
                .build();

        Booking savedBooking =
                bookingRepository.save(booking);

        notificationService.createNotification(
                provider.getUser(),
                "New booking request for " + service.getTitle(),
                NotificationType.NEW_BOOKING,
                savedBooking.getBookingId()
        );

        return mapToResponseDTO(savedBooking);
    }

    @Override
    public BookingResponseDTO rescheduleBooking(
            Long bookingId,
            RescheduleRequestDTO request,
            String customerEmail) {

        if (request.getBookingDate() == null ||
                request.getBookingDate().isBefore(LocalDate.now())) {

            throw new IllegalArgumentException(
                    "Rescheduled booking date cannot be in the past."
            );
        }

        if (request.getBookingTime() == null) {
            throw new IllegalArgumentException(
                    "Booking time is required."
            );
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Booking not found with id: "
                                        + bookingId
                        )
                );

        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found for email: "
                                        + customerEmail
                        )
                );

        if (!booking.getCustomer()
                .getUserId()
                .equals(customer.getUserId())) {

            throw new RuntimeException(
                    "You are not authorized to reschedule this booking"
            );
        }

        BookingStatus currentStatus = booking.getStatus();

        if (currentStatus != BookingStatus.REQUESTED &&
                currentStatus != BookingStatus.ACCEPTED) {

            throw new IllegalStateException(
                    "Only REQUESTED or ACCEPTED bookings can be rescheduled. "
                            + "Current status: "
                            + currentStatus
            );
        }

        boolean slotAlreadyBooked =
                bookingRepository
                        .existsByProvider_ProviderIdAndBookingDateAndBookingTimeAndStatusIn(
                                booking.getProvider().getProviderId(),
                                request.getBookingDate(),
                                request.getBookingTime(),
                                List.of(
                                        BookingStatus.REQUESTED,
                                        BookingStatus.ACCEPTED,
                                        BookingStatus.IN_PROGRESS
                                )
                        );

        boolean sameSlot =
                booking.getBookingDate()
                        .equals(request.getBookingDate())
                        &&
                booking.getBookingTime()
                        .equals(request.getBookingTime());

        if (slotAlreadyBooked && !sameSlot) {
            throw new IllegalStateException(
                    "This time slot is already booked. Please select another date or time."
            );
        }

        booking.setBookingDate(request.getBookingDate());
        booking.setBookingTime(request.getBookingTime());

        Booking savedBooking =
                bookingRepository.save(booking);

        return mapToResponseDTO(savedBooking);
    }

    @Override
    public BookingResponseDTO cancelBookingCustomer(
            Long bookingId,
            String customerEmail) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Booking not found with id: "
                                        + bookingId
                        )
                );

        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found for email: "
                                        + customerEmail
                        )
                );

        if (!booking.getCustomer()
                .getUserId()
                .equals(customer.getUserId())) {

            throw new RuntimeException(
                    "You are not authorized to cancel this booking"
            );
        }

        BookingStatus currentStatus = booking.getStatus();

        if (currentStatus != BookingStatus.REQUESTED &&
                currentStatus != BookingStatus.ACCEPTED) {

            throw new IllegalStateException(
                    "Only REQUESTED or ACCEPTED bookings can be cancelled. "
                            + "Current status: "
                            + currentStatus
            );
        }

        booking.setStatus(BookingStatus.CANCELLED);

        Booking savedBooking =
                bookingRepository.save(booking);

        notificationService.createNotification(
                booking.getProvider().getUser(),
                "Booking for " + booking.getService().getTitle()
                        + " has been cancelled by the customer.",
                NotificationType.BOOKING_CANCELLED,
                booking.getBookingId()
        );

        return mapToResponseDTO(savedBooking);
    }

    @Override
    public List<BookingResponseDTO> getAllBookings() {

        return bookingRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponseDTO getBookingById(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Booking not found with id: "
                                        + bookingId
                        )
                );

        return mapToResponseDTO(booking);
    }

    @Override
    public List<BookingResponseDTO> getMyBookingsCustomer(
            String customerEmail) {

        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found for email: "
                                        + customerEmail
                        )
                );

        return bookingRepository
                .findByCustomer_UserId(customer.getUserId())
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponseDTO> getMyBookingsProvider(
            String providerEmail) {

        ProviderProfile provider =
                providerProfileRepository
                        .findByUser_Email(providerEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Provider not found for email: "
                                                + providerEmail
                                )
                        );

        List<Booking> bookings =
                bookingRepository.findByProvider_ProviderId(
                        provider.getProviderId()
                );

        return bookings.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponseDTO> getBookingsByStatus(
            BookingStatus status) {

        return bookingRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponseDTO updateBookingStatus(
            Long bookingId,
            BookingStatus status,
            String providerEmail) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Booking not found with id: "
                                        + bookingId
                        )
                );

        ProviderProfile provider =
                providerProfileRepository
                        .findByUser_Email(providerEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Provider not found for email: "
                                                + providerEmail
                                )
                        );

        if (!booking.getProvider()
                .getProviderId()
                .equals(provider.getProviderId())) {

            throw new RuntimeException(
                    "You are not authorized to update this booking"
            );
        }

        BookingStatus currentStatus = booking.getStatus();

        if (status == BookingStatus.ACCEPTED) {

            if (currentStatus != BookingStatus.REQUESTED) {

                throw new IllegalStateException(
                        "Only REQUESTED bookings can be accepted. "
                                + "Current status: "
                                + currentStatus
                );
            }
        }

        else if (status == BookingStatus.COMPLETED) {

            if (currentStatus != BookingStatus.ACCEPTED) {

                throw new IllegalStateException(
                        "Only ACCEPTED bookings can be completed. "
                                + "Current status: "
                                + currentStatus
                );
            }
        }

        else if (status == BookingStatus.REJECTED) {

            throw new IllegalStateException(
                    "Use the reject booking endpoint for rejecting bookings."
            );
        }

        booking.setStatus(status);

        Booking updatedBooking =
                bookingRepository.save(booking);

        if (status == BookingStatus.ACCEPTED) {

            notificationService.createNotification(
                    booking.getCustomer(),
                    "Your booking for "
                            + booking.getService().getTitle()
                            + " has been accepted.",
                    NotificationType.BOOKING_ACCEPTED,
                    booking.getBookingId()
            );

        } else if (status == BookingStatus.COMPLETED) {

            notificationService.createNotification(
                    booking.getCustomer(),
                    "Your booking for "
                            + booking.getService().getTitle()
                            + " has been completed.",
                    NotificationType.BOOKING_COMPLETED,
                    booking.getBookingId()
            );
        }

        return mapToResponseDTO(updatedBooking);
    }

    @Override
    public BookingResponseDTO rejectBooking(
            Long bookingId,
            String providerEmail) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Booking not found with id: "
                                        + bookingId
                        )
                );

        ProviderProfile provider =
                providerProfileRepository
                        .findByUser_Email(providerEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Provider not found for email: "
                                                + providerEmail
                        )
                );

        if (!booking.getProvider()
                .getProviderId()
                .equals(provider.getProviderId())) {

            throw new RuntimeException(
                    "You are not authorized to reject this booking"
            );
        }

        if (booking.getStatus() != BookingStatus.REQUESTED) {

            throw new IllegalStateException(
                    "Only REQUESTED bookings can be rejected. "
                            + "Current status: "
                            + booking.getStatus()
            );
        }

        booking.setStatus(BookingStatus.REJECTED);

        Booking updatedBooking =
                bookingRepository.save(booking);

        notificationService.createNotification(
                booking.getCustomer(),
                "Your booking for "
                        + booking.getService().getTitle()
                        + " has been rejected by the provider.",
                NotificationType.BOOKING_REJECTED,
                booking.getBookingId()
        );

        return mapToResponseDTO(updatedBooking);
    }

    @Override
    public void deleteBooking(
            Long bookingId,
            String customerEmail) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Booking not found with id: "
                                        + bookingId
                        )
                );

        User customer =
                userRepository.findByEmail(customerEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found for email: "
                                                + customerEmail
                        )
                        );

        if (!booking.getCustomer()
                .getUserId()
                .equals(customer.getUserId())) {

            throw new RuntimeException(
                    "You are not authorized to delete this booking"
            );
        }

        bookingRepository.delete(booking);
    }

    private BookingResponseDTO mapToResponseDTO(
            Booking booking) {

        return BookingResponseDTO.builder()
                .bookingId(booking.getBookingId())

                .customerId(
                        booking.getCustomer().getUserId()
                )
                .customerName(
                        booking.getCustomer().getName()
                )
                .customerEmail(
                        booking.getCustomer().getEmail()
                )
                .customerPhone(
                        booking.getCustomer().getPhone()
                )

                .providerId(
                        booking.getProvider().getProviderId()
                )
                .providerName(
                        booking.getProvider()
                                .getUser()
                                .getName()
                )
                .providerEmail(
                        booking.getProvider()
                                .getUser()
                                .getEmail()
                )
                .providerPhone(
                        booking.getProvider()
                                .getUser()
                                .getPhone()
                )

                .serviceId(
                        booking.getService()
                                .getServiceId()
                )
                .serviceTitle(
                        booking.getService()
                                .getTitle()
                )

                .bookingDate(
                        booking.getBookingDate()
                )
                .bookingTime(
                        booking.getBookingTime()
                )
                .address(
                        booking.getAddress()
                )
                .totalAmount(
                        booking.getTotalAmount()
                )
                .status(
                        booking.getStatus()
                )
                .paymentMethod(
                        booking.getPaymentMethod()
                )
                .createdAt(
                        booking.getCreatedAt()
                )
                .build();
    }
}
