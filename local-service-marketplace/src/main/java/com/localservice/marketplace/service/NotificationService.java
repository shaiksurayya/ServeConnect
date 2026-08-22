package com.localservice.marketplace.service;

import com.localservice.marketplace.dto.response.NotificationResponseDTO;
import com.localservice.marketplace.entity.User;
import com.localservice.marketplace.enums.NotificationType;

import java.util.List;

public interface NotificationService {

    void createNotification(
            User recipient,
            String message,
            NotificationType type,
            Long relatedBookingId
    );

    List<NotificationResponseDTO> getUserNotifications(String userEmail);

    long getUnreadCount(String userEmail);

    NotificationResponseDTO markAsRead(
            Long notificationId,
            String userEmail
    );

    void markAllAsRead(String userEmail);
}
