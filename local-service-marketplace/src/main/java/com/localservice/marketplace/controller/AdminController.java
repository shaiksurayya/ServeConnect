package com.localservice.marketplace.controller;

import com.localservice.marketplace.dto.request.CategoryRequestDTO;
import com.localservice.marketplace.dto.response.*;
import com.localservice.marketplace.entity.Category;
import com.localservice.marketplace.enums.BookingStatus;
import com.localservice.marketplace.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ==========================================
    // DASHBOARD OVERVIEW
    // ==========================================

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ==========================================
    // USERS MANAGEMENT
    // ==========================================

    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<UserResponseDTO> toggleUserStatus(
            @PathVariable Long userId,
            @RequestParam(required = false) Boolean active) {
        return ResponseEntity.ok(adminService.toggleUserStatus(userId, active));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // PROVIDERS MANAGEMENT
    // ==========================================

    @GetMapping("/providers")
    public ResponseEntity<List<ProviderProfileResponseDTO>> getAllProviders() {
        return ResponseEntity.ok(adminService.getAllProviders());
    }

    @PutMapping("/providers/{providerId}/verify")
    public ResponseEntity<ProviderProfileResponseDTO> toggleProviderVerification(
            @PathVariable Long providerId,
            @RequestParam(required = false) Boolean verified) {
        return ResponseEntity.ok(adminService.toggleProviderVerification(providerId, verified));
    }

    // ==========================================
    // SERVICES MANAGEMENT
    // ==========================================

    @GetMapping("/services")
    public ResponseEntity<List<ServiceResponseDTO>> getAllServices() {
        return ResponseEntity.ok(adminService.getAllServices());
    }

    @PutMapping("/services/{serviceId}/availability")
    public ResponseEntity<ServiceResponseDTO> toggleServiceAvailability(
            @PathVariable Long serviceId,
            @RequestParam(required = false) Boolean availability) {
        return ResponseEntity.ok(adminService.toggleServiceAvailability(serviceId, availability));
    }

    @DeleteMapping("/services/{serviceId}")
    public ResponseEntity<Void> deleteService(@PathVariable Long serviceId) {
        adminService.deleteService(serviceId);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // CATEGORIES MANAGEMENT
    // ==========================================

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(adminService.getAllCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@Valid @RequestBody CategoryRequestDTO request) {
        return new ResponseEntity<>(adminService.createCategory(request), HttpStatus.CREATED);
    }

    @PutMapping("/categories/{categoryId}")
    public ResponseEntity<Category> updateCategory(
            @PathVariable Long categoryId,
            @Valid @RequestBody CategoryRequestDTO request) {
        return ResponseEntity.ok(adminService.updateCategory(categoryId, request));
    }

    @DeleteMapping("/categories/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long categoryId) {
        adminService.deleteCategory(categoryId);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // BOOKINGS MANAGEMENT
    // ==========================================

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        return ResponseEntity.ok(adminService.getAllBookings());
    }

    @PutMapping("/bookings/{bookingId}/status")
    public ResponseEntity<BookingResponseDTO> updateBookingStatus(
            @PathVariable Long bookingId,
            @RequestParam BookingStatus status) {
        return ResponseEntity.ok(adminService.updateBookingStatus(bookingId, status));
    }

    // ==========================================
    // REVIEWS MANAGEMENT
    // ==========================================

    @GetMapping("/reviews")
    public ResponseEntity<List<ReviewResponseDTO>> getAllReviews() {
        return ResponseEntity.ok(adminService.getAllReviews());
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        adminService.deleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }
}
