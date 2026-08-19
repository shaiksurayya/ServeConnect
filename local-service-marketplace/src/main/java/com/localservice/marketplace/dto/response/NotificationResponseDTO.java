package com.localservice.marketplace.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDTO {

    private Long notificationId;
    private Long userId;
    private String message;
    private String type;
    private Long relatedBookingId;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
