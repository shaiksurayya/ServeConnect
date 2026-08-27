package com.localservice.marketplace.service.impl;

import com.localservice.marketplace.dto.request.CategoryRequestDTO;
import com.localservice.marketplace.dto.response.*;
import com.localservice.marketplace.entity.*;
import com.localservice.marketplace.enums.BookingStatus;
import com.localservice.marketplace.enums.Role;
import com.localservice.marketplace.repository.*;
import com.localservice.marketplace.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final ServiceRepository serviceRepository;
    private final CategoryRepository categoryRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
        long totalProviders = providerProfileRepository.count();
        long totalServices = serviceRepository.count();
        long totalCategories = categoryRepository.count();
        long totalBookings = bookingRepository.count();

        List<Booking> allBookings = bookingRepository.findAll();
        long requestedBookings = allBookings.stream().filter(b -> b.getStatus() == BookingStatus.REQUESTED).count();
        long acceptedBookings = allBookings.stream().filter(b -> b.getStatus() == BookingStatus.ACCEPTED).count();
        long completedBookings = allBookings.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED).count();
        long cancelledBookings = allBookings.stream().filter(b -> b.getStatus() == BookingStatus.CANCELLED).count();
        long rejectedBookings = allBookings.stream().filter(b -> b.getStatus() == BookingStatus.REJECTED).count();

        long totalReviews = reviewRepository.count();

        BigDecimal totalCompletedRevenue = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED && b.getTotalAmount() != null)
                .map(Booking::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<BookingResponseDTO> recentBookings = allBookings.stream()
                .sorted(Comparator.comparing(Booking::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(this::mapToBookingDTO)
                .collect(Collectors.toList());

        List<ReviewResponseDTO> recentReviews = reviewRepository.findAll().stream()
                .sorted(Comparator.comparing(Review::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(this::mapToReviewDTO)
                .collect(Collectors.toList());

        List<UserResponseDTO> recentUsers = userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(this::mapToUserDTO)
                .collect(Collectors.toList());

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalCustomers(totalCustomers)
                .totalProviders(totalProviders)
                .totalServices(totalServices)
                .totalCategories(totalCategories)
                .totalBookings(totalBookings)
                .requestedBookings(requestedBookings)
                .acceptedBookings(acceptedBookings)
                .completedBookings(completedBookings)
                .cancelledBookings(cancelledBookings)
                .rejectedBookings(rejectedBookings)
                .totalReviews(totalReviews)
                .totalCompletedRevenue(totalCompletedRevenue)
                .recentBookings(recentBookings)
                .recentReviews(recentReviews)
                .recentUsers(recentUsers)
                .build();
    }

    // ==========================================
    // USER MANAGEMENT
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::mapToUserDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponseDTO toggleUserStatus(Long userId, Boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Cannot modify status of an Administrator account.");
        }

        user.setIsActive(active != null ? active : !Boolean.TRUE.equals(user.getIsActive()));
        User saved = userRepository.save(user);
        return mapToUserDTO(saved);
    }

    @Override
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Cannot delete an Administrator account.");
        }

        userRepository.delete(user);
    }

    // ==========================================
    // PROVIDER MANAGEMENT
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<ProviderProfileResponseDTO> getAllProviders() {
        return providerProfileRepository.findAll().stream()
                .map(this::mapToProviderDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProviderProfileResponseDTO toggleProviderVerification(Long providerId, Boolean verified) {
        ProviderProfile profile = providerProfileRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Provider profile not found with id: " + providerId));

        profile.setIsVerified(verified != null ? verified : !Boolean.TRUE.equals(profile.getIsVerified()));
        ProviderProfile saved = providerProfileRepository.save(profile);
        return mapToProviderDTO(saved);
    }

    // ==========================================
    // SERVICE MANAGEMENT
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<ServiceResponseDTO> getAllServices() {
        return serviceRepository.findAll().stream()
                .map(this::mapToServiceDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceResponseDTO toggleServiceAvailability(Long serviceId, Boolean availability) {
        com.localservice.marketplace.entity.Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + serviceId));

        service.setAvailability(availability != null ? availability : !Boolean.TRUE.equals(service.getAvailability()));
        com.localservice.marketplace.entity.Service saved = serviceRepository.save(service);
        return mapToServiceDTO(saved);
    }

    @Override
    public void deleteService(Long serviceId) {
        com.localservice.marketplace.entity.Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + serviceId));
        serviceRepository.delete(service);
    }

    // ==========================================
    // CATEGORY MANAGEMENT
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Override
    public Category createCategory(CategoryRequestDTO request) {
        String name = request.getName() != null ? request.getName().trim() : "";
        if (name.isEmpty()) {
            throw new IllegalArgumentException("Category name is required.");
        }

        boolean exists = categoryRepository.findAll().stream()
                .anyMatch(c -> c.getName().equalsIgnoreCase(name));
        if (exists) {
            throw new RuntimeException("Category '" + name + "' already exists.");
        }

        Category category = Category.builder()
                .name(name)
                .description(request.getDescription())
                .build();

        return categoryRepository.save(category);
    }

    @Override
    public Category updateCategory(Long categoryId, CategoryRequestDTO request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));

        String name = request.getName() != null ? request.getName().trim() : "";
        if (!name.isEmpty()) {
            category.setName(name);
        }
        category.setDescription(request.getDescription());

        return categoryRepository.save(category);
    }

    @Override
    public void deleteCategory(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new RuntimeException("Category not found with id: " + categoryId);
        }
        categoryRepository.deleteById(categoryId);
    }

    // ==========================================
    // BOOKING MANAGEMENT
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .sorted(Comparator.comparing(Booking::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::mapToBookingDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponseDTO updateBookingStatus(Long bookingId, BookingStatus status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        booking.setStatus(status);
        Booking saved = bookingRepository.save(booking);
        return mapToBookingDTO(saved);
    }

    // ==========================================
    // REVIEW MANAGEMENT
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getAllReviews() {
        return reviewRepository.findAll().stream()
                .sorted(Comparator.comparing(Review::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::mapToReviewDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteReview(Long reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new RuntimeException("Review not found with id: " + reviewId);
        }
        reviewRepository.deleteById(reviewId);
    }

    // ==========================================
    // MAPPERS
    // ==========================================

    private UserResponseDTO mapToUserDTO(User user) {
        return UserResponseDTO.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole())
                .isActive(user.getIsActive() != null ? user.getIsActive() : true)
                .createdAt(user.getCreatedAt())
                .build();
    }

    private ProviderProfileResponseDTO mapToProviderDTO(ProviderProfile profile) {
        User user = profile.getUser();
        return ProviderProfileResponseDTO.builder()
                .providerId(profile.getProviderId())
                .userId(user != null ? user.getUserId() : null)
                .userName(user != null ? user.getName() : null)
                .userEmail(user != null ? user.getEmail() : null)
                .userPhone(user != null ? user.getPhone() : null)
                .userAddress(user != null ? user.getAddress() : null)
                .isActive(user != null && user.getIsActive() != null ? user.getIsActive() : true)
                .experience(profile.getExperience())
                .description(profile.getDescription())
                .isVerified(profile.getIsVerified())
                .avgRating(profile.getAvgRating())
                .createdAt(profile.getCreatedAt())
                .build();
    }

    private ServiceResponseDTO mapToServiceDTO(com.localservice.marketplace.entity.Service service) {
        return ServiceResponseDTO.builder()
                .serviceId(service.getServiceId())
                .providerId(service.getProvider() != null ? service.getProvider().getProviderId() : null)
                .providerName(service.getProvider() != null && service.getProvider().getUser() != null
                        ? service.getProvider().getUser().getName() : null)
                .categoryId(service.getCategory() != null ? service.getCategory().getCategoryId() : null)
                .categoryName(service.getCategory() != null ? service.getCategory().getName() : null)
                .title(service.getTitle())
                .description(service.getDescription())
                .price(service.getPrice())
                .duration(service.getDuration())
                .availability(service.getAvailability())
                .createdAt(service.getCreatedAt())
                .build();
    }

    private BookingResponseDTO mapToBookingDTO(Booking booking) {
        return BookingResponseDTO.builder()
                .bookingId(booking.getBookingId())
                .customerId(booking.getCustomer() != null ? booking.getCustomer().getUserId() : null)
                .customerName(booking.getCustomer() != null ? booking.getCustomer().getName() : null)
                .customerEmail(booking.getCustomer() != null ? booking.getCustomer().getEmail() : null)
                .customerPhone(booking.getCustomer() != null ? booking.getCustomer().getPhone() : null)
                .providerId(booking.getProvider() != null ? booking.getProvider().getProviderId() : null)
                .providerName(booking.getProvider() != null && booking.getProvider().getUser() != null
                        ? booking.getProvider().getUser().getName() : null)
                .providerEmail(booking.getProvider() != null && booking.getProvider().getUser() != null
                        ? booking.getProvider().getUser().getEmail() : null)
                .providerPhone(booking.getProvider() != null && booking.getProvider().getUser() != null
                        ? booking.getProvider().getUser().getPhone() : null)
                .serviceId(booking.getService() != null ? booking.getService().getServiceId() : null)
                .serviceTitle(booking.getService() != null ? booking.getService().getTitle() : null)
                .bookingDate(booking.getBookingDate())
                .bookingTime(booking.getBookingTime())
                .address(booking.getAddress())
                .totalAmount(booking.getTotalAmount())
                .status(booking.getStatus())
                .paymentMethod(booking.getPaymentMethod())
                .createdAt(booking.getCreatedAt())
                .build();
    }

    private ReviewResponseDTO mapToReviewDTO(Review review) {
        return ReviewResponseDTO.builder()
                .reviewId(review.getReviewId())
                .bookingId(review.getBooking() != null ? review.getBooking().getBookingId() : null)
                .customerId(review.getCustomer() != null ? review.getCustomer().getUserId() : null)
                .customerName(review.getCustomer() != null ? review.getCustomer().getName() : null)
                .providerId(review.getProvider() != null ? review.getProvider().getProviderId() : null)
                .providerName(review.getProvider() != null && review.getProvider().getUser() != null
                        ? review.getProvider().getUser().getName() : null)
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
