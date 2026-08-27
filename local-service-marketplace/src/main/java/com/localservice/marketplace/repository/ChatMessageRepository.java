package com.localservice.marketplace.repository;

import com.localservice.marketplace.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByBooking_BookingIdOrderByCreatedAtAsc(Long bookingId);

    List<ChatMessage> findByBooking_BookingIdAndMessageIdGreaterThanOrderByCreatedAtAsc(Long bookingId, Long lastMessageId);
}
