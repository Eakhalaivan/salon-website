package com.luxesuite.api.service.whatsapp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@ConditionalOnProperty(name = "whatsapp.provider", havingValue = "meta")
public class MetaCloudApiWhatsAppService implements WhatsAppService {

    private static final Logger log = LoggerFactory.getLogger(MetaCloudApiWhatsAppService.class);

    @Value("${whatsapp.meta.api-key:}")
    private String apiKey;

    @Value("${whatsapp.meta.phone-number-id:}")
    private String phoneNumberId;

    @Override
    public String sendMessage(String phoneNumber, String templateName, Map<String, String> templateParams) {
        log.info("MetaCloudApiWhatsAppService sending message to {} using template {}", phoneNumber, templateName);
        
        // TODO: Implement actual HTTP call to Meta Cloud API
        /*
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Sketch of the Meta Cloud API request structure:
        // {
        //   "messaging_product": "whatsapp",
        //   "to": phoneNumber,
        //   "type": "template",
        //   "template": {
        //     "name": templateName,
        //     "language": {
        //       "code": "en_US"
        //     },
        //     "components": [
        //       {
        //         "type": "body",
        //         "parameters": [
        //            // map templateParams to text parameters
        //         ]
        //       }
        //     ]
        //   }
        // }
        
        String url = "https://graph.facebook.com/v17.0/" + phoneNumberId + "/messages";
        // HttpEntity<String> entity = new HttpEntity<>(requestJson, headers);
        // ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
        // return response.getStatusCode().is2xxSuccessful() ? "SENT" : "FAILED";
        */

        return "SKIPPED_NO_PROVIDER";
    }
}
