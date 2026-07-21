package com.luxesuite.api.repository;

import com.luxesuite.api.model.WhatsAppMessageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WhatsAppMessageLogRepository extends JpaRepository<WhatsAppMessageLog, Long> {
}
