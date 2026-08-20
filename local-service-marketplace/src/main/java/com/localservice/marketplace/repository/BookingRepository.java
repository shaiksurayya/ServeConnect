// package com.localservice.marketplace.repository;

// import com.localservice.marketplace.entity.Booking;
// import com.localservice.marketplace.enums.BookingStatus;
// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.stereotype.Repository;

// import java.util.List;

// @Repository
// public interface BookingRepository extends JpaRepository<Booking, Long> {

//     List<Booking> findByCustomer_UserId(Long customerId);

//     List<Booking> findByProvider_ProviderId(Long providerId);

//     List<Booking> findByStatus(BookingStatus status);

//     List<Booking> findByService_ServiceId(Long serviceId);
// }

package com.localservice.marketplace.repository;

import com.localservice.marketplace.entity.Booking;
import com.localservice.marketplace.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomer_UserId(Long customerId);

    List<Booking> findByProvider_ProviderId(Long providerId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByService_ServiceId(Long serviceId);

    boolean existsByService_ServiceIdAndBookingDateAndBookingTimeAndStatusIn(
            Long serviceId,
            LocalDate bookingDate,
            LocalTime bookingTime,
            List<BookingStatus> statuses
    );
}