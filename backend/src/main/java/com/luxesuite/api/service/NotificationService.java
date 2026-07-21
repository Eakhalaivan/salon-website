package com.luxesuite.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import com.luxesuite.api.model.AppNotification;
import com.luxesuite.api.model.NotificationType;
import com.luxesuite.api.model.User;
import com.luxesuite.api.repository.AppNotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final AppNotificationRepository appNotificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final EmailService emailService;
    private final SmsService smsService;
    private final WhatsAppService whatsAppService;

    public void sendEmail(String to, String subject, String body) {
        try {
            emailService.sendEmail(to, subject, body);
        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
        }
    }

    public void sendSms(String phone, String message) {
        try {
            smsService.sendSms(phone, message);
        } catch (Exception e) {
            log.error("Failed to send SMS to {}", phone, e);
        }
    }

    public void sendWhatsApp(String phone, String message) {
        try {
            whatsAppService.sendWhatsAppMessage(phone, message);
        } catch (Exception e) {
            log.error("Failed to send WhatsApp to {}", phone, e);
        }
    }

    @Async("taskExecutor")
    public void sendAppNotification(User user, String title, String message, NotificationType type) {
        AppNotification notification = AppNotification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        appNotificationRepository.save(notification);
        log.info("App Notification saved for user {}: {}", user.getId(), title);
        
        // Broadcast over WebSocket to the specific user
        messagingTemplate.convertAndSendToUser(
                user.getEmail(),
                "/queue/notifications",
                notification
        );
    }
}
