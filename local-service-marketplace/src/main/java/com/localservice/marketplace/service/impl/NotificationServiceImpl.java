package com.localservice.marketplace.service.impl;

import com.localservice.marketplace.dto.response.NotificationResponseDTO;
import com.localservice.marketplace.entity.Notification;
import com.localservice.marketplace.entity.User;
import com.localservice.marketplace.repository.NotificationRepository;
import com.localservice.marketplace.repository.UserRepository;
import com.localservice.marketplace.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public void createNotification(User recipient, String message, String type, Long relatedBookingId) {
        if (recipient == null) return;
        Notification notification = Notification.builder()
                .user(recipient)
                .message(message)
                .type(type)
                .relatedBookingId(relatedBookingId)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getUserNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
        return notificationRepository.findByUser_UserIdOrderByCreatedAtDesc(user.getUserId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
        return notificationRepository.countByUser_UserIdAndIsReadFalse(user.getUserId());
    }

    @Override
    public NotificationResponseDTO markAsRead(Long notificationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));

        if (!notification.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Not authorized to update this notification");
        }

        notification.setIsRead(true);
        Notification saved = notificationRepository.save(notification);
        return mapToDTO(saved);
    }

    @Override
    public void markAllAsRead(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        List<Notification> unreadList = notificationRepository.findByUser_UserIdOrderByCreatedAtDesc(user.getUserId())
                .stream()
                .filter(n -> !n.getIsRead())
                .collect(Collectors.toList());

        for (Notification n : unreadList) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(unreadList);
    }

    private NotificationResponseDTO mapToDTO(Notification n) {
        return NotificationResponseDTO.builder()
                .notificationId(n.getNotificationId())
                .userId(n.getUser().getUserId())
                .message(n.getMessage())
                .type(n.getType())
                .relatedBookingId(n.getRelatedBookingId())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
