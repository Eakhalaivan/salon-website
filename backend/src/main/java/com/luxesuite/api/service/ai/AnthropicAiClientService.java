package com.luxesuite.api.service.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class AnthropicAiClientService implements AiClientService {

    private final RestTemplate restTemplate;
    
    @Value("${ai.provider.anthropic.key:}")
    private String apiKey;

    @Value("${ai.provider.anthropic.model:claude-3-haiku-20240307}")
    private String model;

    public AnthropicAiClientService() {
        this.restTemplate = new RestTemplate();
        // Set standard timeouts on RestTemplate for safety (e.g., 5-10s max)
        org.springframework.http.client.SimpleClientHttpRequestFactory requestFactory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(3000);
        requestFactory.setReadTimeout(10000);
        this.restTemplate.setRequestFactory(requestFactory);
    }

    @Override
    public String complete(String systemPrompt, String userPrompt) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("Anthropic API key is not configured. Falling back to heuristic.");
            return "";
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", apiKey);
            headers.set("anthropic-version", "2023-06-01");

            Map<String, Object> requestBody = Map.of(
                "model", model,
                "max_tokens", 1024,
                "system", systemPrompt,
                "messages", List.of(
                    Map.of("role", "user", "content", userPrompt)
                )
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            // Using Map for dynamic JSON response parsing for simplicity
            Map response = restTemplate.postForObject("https://api.anthropic.com/v1/messages", request, Map.class);
            
            if (response != null && response.containsKey("content")) {
                List<Map<String, Object>> contentList = (List<Map<String, Object>>) response.get("content");
                if (!contentList.isEmpty()) {
                    return (String) contentList.get(0).get("text");
                }
            }
            return "";
            
        } catch (Exception e) {
            log.error("AI API call failed: {}. Falling back gracefully.", e.getMessage());
            return "";
        }
    }
}
