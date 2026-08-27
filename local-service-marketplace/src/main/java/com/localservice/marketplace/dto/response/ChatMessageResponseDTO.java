package com.localservice.marketplace.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageResponseDTO {

    private Long messageId;
    private Long bookingId;
    private Long senderId;
    private String senderName;
    private String senderEmail;
    private String senderRole;
    private String message;
    private LocalDateTime createdAt;
}
