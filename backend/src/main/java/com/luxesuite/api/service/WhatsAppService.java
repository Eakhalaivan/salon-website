package com.luxesuite.api.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class WhatsAppService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${whatsapp.api.url:}")
    private String apiUrl;

    @Value("${whatsapp.api.token:}")
    private String apiToken;

    private boolean isConfigured() {
        return apiUrl != null && !apiUrl.isEmpty() && apiToken != null && !apiToken.isEmpty();
    }

    @Async("taskExecutor")
    public void sendWhatsAppMessage(String toPhone, String messageBody) {
        if (!isConfigured()) {
            log.warn("WhatsApp is not configured. Mock sending WhatsApp to {}: {}", toPhone, messageBody);
            return;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiToken);

            Map<String, Object> body = new HashMap<>();
            body.put("messaging_product", "whatsapp");
            body.put("recipient_type", "individual");
            body.put("to", toPhone);
            body.put("type", "text");
            
            Map<String, String> text = new HashMap<>();
            text.put("preview_url", "false");
            text.put("body", messageBody);
            body.put("text", text);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("WhatsApp message sent successfully to {}", toPhone);
            } else {
                log.error("Failed to send WhatsApp message. Status: {}, Response: {}", response.getStatusCode(), response.getBody());
                throw new RuntimeException("WhatsApp delivery failed with status " + response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("Exception occurred while sending WhatsApp message to {}", toPhone, e);
            throw new RuntimeException("WhatsApp delivery failed", e);
        }
    }
}
