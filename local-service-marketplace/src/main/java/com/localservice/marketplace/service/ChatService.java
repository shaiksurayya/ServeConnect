package com.localservice.marketplace.service;

import com.localservice.marketplace.dto.request.SendMessageRequestDTO;
import com.localservice.marketplace.dto.response.ChatMessageResponseDTO;

import java.util.List;

public interface ChatService {

    List<ChatMessageResponseDTO> getMessages(Long bookingId, String userEmail);

    ChatMessageResponseDTO sendMessage(Long bookingId, SendMessageRequestDTO request, String userEmail);
}
