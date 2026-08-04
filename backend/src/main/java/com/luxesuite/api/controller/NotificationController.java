package com.luxesuite.api.controller;

import com.luxesuite.api.model.AppNotification;
import com.luxesuite.api.repository.AppNotificationRepository;
import com.luxesuite.api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final AppNotificationRepository notificationRepository;
    private final SecurityUtils securityUtils;

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AppNotification>> getMyNotifications() {
        com.luxesuite.api.model.User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }

    @GetMapping("/my/unread")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AppNotification>> getMyUnreadNotifications() {
        com.luxesuite.api.model.User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId()));
    }

    @PutMapping("/my/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        com.luxesuite.api.model.User user = securityUtils.getCurrentUser();
        return notificationRepository.findById(id)
                .filter(n -> n.getUser().getId().equals(user.getId()))
                .map(n -> {
                    n.setIsRead(true);
                    notificationRepository.save(n);
                    return new ResponseEntity<Void>(org.springframework.http.HttpStatus.OK);
                })
                .orElse(new ResponseEntity<Void>(org.springframework.http.HttpStatus.NOT_FOUND));
    }

    @PutMapping("/my/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAllAsRead() {
        com.luxesuite.api.model.User user = securityUtils.getCurrentUser();
        List<AppNotification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId());
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
        return ResponseEntity.ok().build();
    }
}
