package com.luxesuite.api.service.ai;

public interface AiClientService {
    /**
     * Completes a chat prompt using the configured AI model.
     * 
     * @param systemPrompt The system prompt to set the context.
     * @param userPrompt The user's input prompt.
     * @return The AI's response text, or a fallback string if the call fails or is unconfigured.
     */
    String complete(String systemPrompt, String userPrompt);
}
