package com.localservice.marketplace.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {

    private long totalUsers;
    private long totalCustomers;
    private long totalProviders;
    private long totalServices;
    private long totalCategories;
    private long totalBookings;
    private long requestedBookings;
    private long acceptedBookings;
    private long completedBookings;
    private long cancelledBookings;
    private long rejectedBookings;
    private long totalReviews;
    private BigDecimal totalCompletedRevenue;

    private List<BookingResponseDTO> recentBookings;
    private List<ReviewResponseDTO> recentReviews;
    private List<UserResponseDTO> recentUsers;
}
