package com.luxesuite.api.repository;

import com.luxesuite.api.model.AppNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppNotificationRepository extends JpaRepository<AppNotification, Long> {
    List<AppNotification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<AppNotification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
}
