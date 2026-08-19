package com.localservice.marketplace.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ProviderDashboardResponse {
    private Long providerId;
    private String providerName;
    private long totalServices;
    private long activeServices;
    private long totalBookings;
    private long pendingBookings;
    private long acceptedBookings;
    private long completedBookings;
    private long rejectedBookings;
    private long cancelledBookings;
    private long totalReviews;
    private double averageRating;
    private BigDecimal totalCompletedEarnings;
}

