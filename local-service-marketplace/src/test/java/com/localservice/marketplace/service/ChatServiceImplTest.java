package com.localservice.marketplace.service;

import com.localservice.marketplace.dto.request.SendMessageRequestDTO;
import com.localservice.marketplace.dto.response.ChatMessageResponseDTO;
import com.localservice.marketplace.entity.Booking;
import com.localservice.marketplace.entity.ChatMessage;
import com.localservice.marketplace.entity.ProviderProfile;
import com.localservice.marketplace.entity.Service;
import com.localservice.marketplace.entity.User;
import com.localservice.marketplace.enums.BookingStatus;
import com.localservice.marketplace.enums.NotificationType;
import com.localservice.marketplace.enums.Role;
import com.localservice.marketplace.repository.BookingRepository;
import com.localservice.marketplace.repository.ChatMessageRepository;
import com.localservice.marketplace.repository.UserRepository;
import com.localservice.marketplace.service.impl.ChatServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceImplTest {

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ChatServiceImpl chatService;

    private User customer;
    private User providerUser;
    private User thirdPartyUser;
    private ProviderProfile providerProfile;
    private Booking booking;

    @BeforeEach
    void setUp() {
        customer = User.builder()
                .userId(1L)
                .name("Alice Customer")
                .email("alice@example.com")
                .role(Role.CUSTOMER)
                .build();

        providerUser = User.builder()
                .userId(2L)
                .name("Bob Provider")
                .email("bob@example.com")
                .role(Role.PROVIDER)
                .build();

        thirdPartyUser = User.builder()
                .userId(3L)
                .name("Charlie Stranger")
                .email("charlie@example.com")
                .role(Role.CUSTOMER)
                .build();

        providerProfile = ProviderProfile.builder()
                .providerId(10L)
                .user(providerUser)
                .build();

        Service service = Service.builder()
                .serviceId(100L)
                .title("Home Cleaning")
                .provider(providerProfile)
                .build();

        booking = Booking.builder()
                .bookingId(500L)
                .customer(customer)
                .provider(providerProfile)
                .service(service)
                .status(BookingStatus.ACCEPTED)
                .build();
    }

    @Test
    void testCustomerSendMessageSuccess() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(customer));
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(booking));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenAnswer(invocation -> {
            ChatMessage msg = invocation.getArgument(0);
            msg.setMessageId(1L);
            msg.setCreatedAt(LocalDateTime.now());
            return msg;
        });

        SendMessageRequestDTO request = SendMessageRequestDTO.builder()
                .message("Hello, what time will you arrive?")
                .build();

        ChatMessageResponseDTO response = chatService.sendMessage(500L, request, "alice@example.com");

        assertNotNull(response);
        assertEquals(500L, response.getBookingId());
        assertEquals(1L, response.getSenderId());
        assertEquals("Alice Customer", response.getSenderName());
        assertEquals("Hello, what time will you arrive?", response.getMessage());

        // Verify notification sent to Bob (the provider)
        verify(notificationService, times(1)).createNotification(
                eq(providerUser),
                contains("Alice Customer"),
                eq(NotificationType.NEW_MESSAGE),
                eq(500L)
        );
    }

    @Test
    void testProviderSendMessageSuccess() {
        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(providerUser));
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(booking));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenAnswer(invocation -> {
            ChatMessage msg = invocation.getArgument(0);
            msg.setMessageId(2L);
            msg.setCreatedAt(LocalDateTime.now());
            return msg;
        });

        SendMessageRequestDTO request = SendMessageRequestDTO.builder()
                .message("I will arrive by 10 AM.")
                .build();

        ChatMessageResponseDTO response = chatService.sendMessage(500L, request, "bob@example.com");

        assertNotNull(response);
        assertEquals(500L, response.getBookingId());
        assertEquals(2L, response.getSenderId());
        assertEquals("Bob Provider", response.getSenderName());
        assertEquals("I will arrive by 10 AM.", response.getMessage());

        // Verify notification sent to Alice (the customer)
        verify(notificationService, times(1)).createNotification(
                eq(customer),
                contains("Bob Provider"),
                eq(NotificationType.NEW_MESSAGE),
                eq(500L)
        );
    }

    @Test
    void testUnauthorizedUserCannotSendMessage() {
        when(userRepository.findByEmail("charlie@example.com")).thenReturn(Optional.of(thirdPartyUser));
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(booking));

        SendMessageRequestDTO request = SendMessageRequestDTO.builder()
                .message("I shouldn't be allowed here.")
                .build();

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                chatService.sendMessage(500L, request, "charlie@example.com")
        );

        assertTrue(ex.getMessage().contains("not authorized"));
        verify(chatMessageRepository, never()).save(any());
        verify(notificationService, never()).createNotification(any(), any(), any(), any());
    }

    @Test
    void testUnauthorizedUserCannotGetMessages() {
        when(userRepository.findByEmail("charlie@example.com")).thenReturn(Optional.of(thirdPartyUser));
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(booking));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                chatService.getMessages(500L, "charlie@example.com")
        );

        assertTrue(ex.getMessage().contains("not authorized"));
        verify(chatMessageRepository, never()).findByBooking_BookingIdOrderByCreatedAtAsc(any());
    }

    @Test
    void testGetMessagesSuccess() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(customer));
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(booking));

        ChatMessage m1 = ChatMessage.builder()
                .messageId(10L)
                .booking(booking)
                .sender(customer)
                .message("Hi Bob")
                .createdAt(LocalDateTime.now().minusMinutes(5))
                .build();

        ChatMessage m2 = ChatMessage.builder()
                .messageId(11L)
                .booking(booking)
                .sender(providerUser)
                .message("Hi Alice")
                .createdAt(LocalDateTime.now().minusMinutes(3))
                .build();

        when(chatMessageRepository.findByBooking_BookingIdOrderByCreatedAtAsc(500L))
                .thenReturn(List.of(m1, m2));

        List<ChatMessageResponseDTO> list = chatService.getMessages(500L, "alice@example.com");

        assertEquals(2, list.size());
        assertEquals("Hi Bob", list.get(0).getMessage());
        assertEquals("Hi Alice", list.get(1).getMessage());
    }
}
