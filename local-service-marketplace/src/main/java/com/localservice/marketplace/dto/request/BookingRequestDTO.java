package com.localservice.marketplace.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequestDTO {

    private Long customerId;

    private Long providerId;

    @NotNull
    private Long serviceId;

    @NotNull
    private LocalDate bookingDate;

    @NotNull
    private LocalTime bookingTime;

    @NotBlank
    private String address;
}