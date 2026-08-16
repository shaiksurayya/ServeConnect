package com.localservice.marketplace.dto.response;

import com.localservice.marketplace.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponseDTO {

    private Long bookingId;

    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    private Long providerId;
    private String providerName;
    private String providerEmail;
    private String providerPhone;

    private Long serviceId;
    private String serviceTitle;

    private LocalDate bookingDate;
    private LocalTime bookingTime;
    private String address;

    private BigDecimal totalAmount;
    private BookingStatus status;
    private String paymentMethod;

    private LocalDateTime createdAt;

    private boolean reviewed;
    private Long reviewId;
    private Integer reviewRating;
    private String reviewComment;
}

// package com.localservice.marketplace.dto.response;

// import com.localservice.marketplace.enums.BookingStatus;
// import lombok.AllArgsConstructor;
// import lombok.Builder;
// import lombok.Getter;
// import lombok.NoArgsConstructor;
// import lombok.Setter;

// import java.math.BigDecimal;
// import java.time.LocalDate;
// import java.time.LocalDateTime;
// import java.time.LocalTime;

// @Getter
// @Setter
// @Builder
// @NoArgsConstructor
// @AllArgsConstructor
// public class BookingResponseDTO {

//     private Long bookingId;

//     private Long customerId;
//     private String customerName;

//     private Long providerId;
//     private String providerName;

//     private Long serviceId;
//     private String serviceTitle;

//     private LocalDate bookingDate;
//     private LocalTime bookingTime;
//     private String address;

//     private BigDecimal totalAmount;
//     private BookingStatus status;
//     private String paymentMethod;

//     private LocalDateTime createdAt;

//     private boolean reviewed;
//     private Long reviewId;
//     private Integer reviewRating;
//     private String reviewComment;
// }