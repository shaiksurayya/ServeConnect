package com.localservice.marketplace.controller;

import com.localservice.marketplace.dto.request.SendMessageRequestDTO;
import com.localservice.marketplace.dto.response.ChatMessageResponseDTO;
import com.localservice.marketplace.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings/{bookingId}/messages")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping
    public ResponseEntity<List<ChatMessageResponseDTO>> getMessages(
            @PathVariable Long bookingId,
            Authentication authentication) {
        List<ChatMessageResponseDTO> messages = chatService.getMessages(bookingId, authentication.getName());
        return ResponseEntity.ok(messages);
    }

    @PostMapping
    public ResponseEntity<ChatMessageResponseDTO> sendMessage(
            @PathVariable Long bookingId,
            @Valid @RequestBody SendMessageRequestDTO request,
            Authentication authentication) {
        ChatMessageResponseDTO response = chatService.sendMessage(bookingId, request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
