package com.localservice.marketplace.service.impl;

import com.localservice.marketplace.dto.request.SendMessageRequestDTO;
import com.localservice.marketplace.dto.response.ChatMessageResponseDTO;
import com.localservice.marketplace.entity.Booking;
import com.localservice.marketplace.entity.ChatMessage;
import com.localservice.marketplace.entity.User;
import com.localservice.marketplace.enums.NotificationType;
import com.localservice.marketplace.repository.BookingRepository;
import com.localservice.marketplace.repository.ChatMessageRepository;
import com.localservice.marketplace.repository.UserRepository;
import com.localservice.marketplace.service.ChatService;
import com.localservice.marketplace.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageResponseDTO> getMessages(Long bookingId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        validateBookingParticipant(booking, user);

        return chatMessageRepository.findByBooking_BookingIdOrderByCreatedAtAsc(bookingId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ChatMessageResponseDTO sendMessage(Long bookingId, SendMessageRequestDTO request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        validateBookingParticipant(booking, user);

        String trimmedMessage = request.getMessage() != null ? request.getMessage().trim() : "";
        if (trimmedMessage.isEmpty()) {
            throw new IllegalArgumentException("Message cannot be empty.");
        }

        // Determine recipient
        User recipient;
        if (user.getUserId().equals(booking.getCustomer().getUserId())) {
            recipient = booking.getProvider().getUser();
        } else {
            recipient = booking.getCustomer();
        }

        ChatMessage chatMessage = ChatMessage.builder()
                .booking(booking)
                .sender(user)
                .message(trimmedMessage)
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);

        // Send notification to recipient
        String preview = trimmedMessage.length() > 50 ? trimmedMessage.substring(0, 47) + "..." : trimmedMessage;
        notificationService.createNotification(
                recipient,
                "New message from " + user.getName() + " for " + booking.getService().getTitle() + ": \"" + preview + "\"",
                NotificationType.NEW_MESSAGE,
                booking.getBookingId()
        );

        return mapToDTO(savedMessage);
    }

    private void validateBookingParticipant(Booking booking, User user) {
        Long customerUserId = booking.getCustomer().getUserId();
        Long providerUserId = booking.getProvider().getUser().getUserId();

        if (!user.getUserId().equals(customerUserId) && !user.getUserId().equals(providerUserId)) {
            throw new RuntimeException("You are not authorized to access messages for this booking.");
        }
    }

    private ChatMessageResponseDTO mapToDTO(ChatMessage message) {
        return ChatMessageResponseDTO.builder()
                .messageId(message.getMessageId())
                .bookingId(message.getBooking().getBookingId())
                .senderId(message.getSender().getUserId())
                .senderName(message.getSender().getName())
                .senderEmail(message.getSender().getEmail())
                .senderRole(message.getSender().getRole() != null ? message.getSender().getRole().name() : null)
                .message(message.getMessage())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
