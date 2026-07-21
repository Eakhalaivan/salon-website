package com.luxesuite.api.service.whatsapp;

import java.util.Map;

public interface WhatsAppService {
    /**
     * Sends a WhatsApp message using a pre-approved template.
     *
     * @param phoneNumber The destination phone number.
     * @param templateName The name of the WhatsApp template.
     * @param templateParams Parameters to inject into the template.
     * @return The status of the message attempt (e.g., "SENT", "FAILED", "SKIPPED_NO_PROVIDER").
     */
    String sendMessage(String phoneNumber, String templateName, Map<String, String> templateParams);
}
