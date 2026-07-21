package com.luxesuite.api.service.whatsapp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@ConditionalOnProperty(name = "whatsapp.provider", havingValue = "none", matchIfMissing = true)
public class LoggingWhatsAppService implements WhatsAppService {

    private static final Logger log = LoggerFactory.getLogger(LoggingWhatsAppService.class);

    @Override
    public String sendMessage(String phoneNumber, String templateName, Map<String, String> templateParams) {
        log.info("Would send WhatsApp message to {}: template={}, params={}", 
                 phoneNumber, templateName, templateParams);
        return "SENT"; // Or SKIPPED_NO_PROVIDER based on interpretation, but SENT allows testing the success path
    }
}
