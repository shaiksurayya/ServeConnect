package com.localservice.marketplace.service.impl;

import com.localservice.marketplace.dto.response.BookingSummaryDTO;
import com.localservice.marketplace.dto.response.CustomerDashboardResponse;
import com.localservice.marketplace.dto.response.ProviderDashboardResponse;
import com.localservice.marketplace.entity.Booking;
import com.localservice.marketplace.entity.ProviderProfile;
import com.localservice.marketplace.entity.User;
import com.localservice.marketplace.enums.BookingStatus;
import com.localservice.marketplace.repository.BookingRepository;
import com.localservice.marketplace.repository.ProviderProfileRepository;
import com.localservice.marketplace.repository.ReviewRepository;
import com.localservice.marketplace.repository.ServiceRepository;
import com.localservice.marketplace.repository.UserRepository;
import com.localservice.marketplace.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;
    private final ReviewRepository reviewRepository;

    @Override
    public CustomerDashboardResponse getCustomerDashboard(String customerEmail) {
        User user = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        List<Booking> bookings = bookingRepository.findByCustomer_UserId(user.getUserId());

        long pending = bookings.stream().filter(b -> b.getStatus() == BookingStatus.REQUESTED).count();
        long accepted = bookings.stream().filter(b -> b.getStatus() == BookingStatus.ACCEPTED).count();
        long completed = bookings.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED).count();
        long cancelled = bookings.stream().filter(b -> b.getStatus() == BookingStatus.CANCELLED).count();
        long totalReviews = reviewRepository.findByCustomer_UserId(user.getUserId()).size();

        LocalDate today = LocalDate.now();

        BookingSummaryDTO upcomingBooking = bookings.stream()
                .filter(b -> (b.getStatus() == BookingStatus.ACCEPTED || b.getStatus() == BookingStatus.REQUESTED)
                        && !b.getBookingDate().isBefore(today))
                .min(Comparator.comparing(Booking::getBookingDate))
                .map(this::toSummary)
                .orElse(null);

        List<BookingSummaryDTO> recentBookings = bookings.stream()
                .sorted(Comparator.comparing(Booking::getCreatedAt).reversed())
                .limit(5)
                .map(this::toSummary)
                .collect(Collectors.toList());

        Set<Long> bookedServiceIds = bookings.stream()
                .map(b -> b.getService().getServiceId())
                .collect(Collectors.toSet());

        List<String> recommendedServices = serviceRepository.findAll().stream()
                .filter(com.localservice.marketplace.entity.Service::getAvailability)
                .filter(s -> !bookedServiceIds.contains(s.getServiceId()))
                .limit(4)
                .map(com.localservice.marketplace.entity.Service::getTitle)
                .collect(Collectors.toList());

        return CustomerDashboardResponse.builder()
                .name(user.getName())
                .totalBookings(bookings.size())
                .pendingBookings(pending)
                .acceptedBookings(accepted)
                .completedBookings(completed)
                .cancelledBookings(cancelled)
                .totalReviews(totalReviews)
                .upcomingBooking(upcomingBooking)
                .recentBookings(recentBookings)
                .recommendedServices(recommendedServices)
                .build();
    }

    private BookingSummaryDTO toSummary(Booking booking) {
        return BookingSummaryDTO.builder()
                .bookingId(booking.getBookingId())
                .serviceName(booking.getService().getTitle())
                .bookingDate(booking.getBookingDate())
                .status(booking.getStatus())
                .build();
    }

    @Override
    public ProviderDashboardResponse getProviderDashboard(String providerEmail) {
        ProviderProfile providerProfile = providerProfileRepository.findByUser_Email(providerEmail)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        List<com.localservice.marketplace.entity.Service> services = serviceRepository.findByProvider_ProviderId(providerProfile.getProviderId());
        long activeServices = services.stream().filter(com.localservice.marketplace.entity.Service::getAvailability).count();
        
        List<Booking> bookings = bookingRepository.findByProvider_ProviderId(providerProfile.getProviderId());
        long pending = bookings.stream().filter(b -> b.getStatus() == BookingStatus.REQUESTED).count();
        long accepted = bookings.stream().filter(b -> b.getStatus() == BookingStatus.ACCEPTED).count();
        long completed = bookings.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED).count();
        long rejected = bookings.stream().filter(b -> b.getStatus() == BookingStatus.REJECTED).count();
        long cancelled = bookings.stream().filter(b -> b.getStatus() == BookingStatus.CANCELLED).count();
        long totalReviews = reviewRepository.findByProvider_ProviderId(providerProfile.getProviderId()).size();

        BigDecimal totalCompletedEarnings = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .map(Booking::getTotalAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ProviderDashboardResponse.builder()
                .providerId(providerProfile.getProviderId())
                .providerName(providerProfile.getUser().getName())
                .totalServices(services.size())
                .activeServices(activeServices)
                .totalBookings(bookings.size())
                .pendingBookings(pending)
                .acceptedBookings(accepted)
                .completedBookings(completed)
                .rejectedBookings(rejected)
                .cancelledBookings(cancelled)
                .totalReviews(totalReviews)
                .averageRating(providerProfile.getAvgRating() != null ? providerProfile.getAvgRating().doubleValue() : 0.0)
                .totalCompletedEarnings(totalCompletedEarnings)
                .build();
    }
}

