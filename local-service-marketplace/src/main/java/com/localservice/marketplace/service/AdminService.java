package com.localservice.marketplace.service;

import com.localservice.marketplace.dto.request.CategoryRequestDTO;
import com.localservice.marketplace.dto.response.*;
import com.localservice.marketplace.entity.Category;
import com.localservice.marketplace.enums.BookingStatus;

import java.util.List;

public interface AdminService {

    AdminDashboardResponse getDashboardStats();

    // User Management
    List<UserResponseDTO> getAllUsers();
    UserResponseDTO toggleUserStatus(Long userId, Boolean active);
    void deleteUser(Long userId);

    // Provider Management
    List<ProviderProfileResponseDTO> getAllProviders();
    ProviderProfileResponseDTO toggleProviderVerification(Long providerId, Boolean verified);

    // Service Management
    List<ServiceResponseDTO> getAllServices();
    ServiceResponseDTO toggleServiceAvailability(Long serviceId, Boolean availability);
    void deleteService(Long serviceId);

    // Category Management
    List<Category> getAllCategories();
    Category createCategory(CategoryRequestDTO request);
    Category updateCategory(Long categoryId, CategoryRequestDTO request);
    void deleteCategory(Long categoryId);

    // Booking Management
    List<BookingResponseDTO> getAllBookings();
    BookingResponseDTO updateBookingStatus(Long bookingId, BookingStatus status);

    // Review Management
    List<ReviewResponseDTO> getAllReviews();
    void deleteReview(Long reviewId);
}
