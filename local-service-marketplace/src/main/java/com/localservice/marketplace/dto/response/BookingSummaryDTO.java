package com.localservice.marketplace.dto.response;

import com.localservice.marketplace.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingSummaryDTO {

    private Long bookingId;
    private String serviceName;
    private LocalDate bookingDate;
    private BookingStatus status;
}
