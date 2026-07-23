package com.luxesuite.api.service.ai;

import com.luxesuite.api.dto.ChatMessageDto;
import com.luxesuite.api.dto.ChatRequestDto;
import com.luxesuite.api.model.Service;
import com.luxesuite.api.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotService {

    private final ServiceRepository serviceRepository;
    private final AiClientService aiClientService;

    @Transactional(readOnly = true)
    public ChatMessageDto chat(ChatRequestDto request) {
        // Fetch real catalog data to ground the AI
        List<Service> catalog = serviceRepository.findByIsActiveTrue(org.springframework.data.domain.Pageable.unpaged()).getContent();
        
        String catalogString = catalog.stream()
                .map(s -> String.format("- %s (Price: ₹%s, Duration: %s mins): %s", 
                        s.getName(), s.getPrice(), s.getDurationMins(), s.getDescription()))
                .collect(Collectors.joining("\n"));

        String systemPrompt = "You are Lumina, the elegant and polite virtual assistant for LuxeSuite Spa & Salon. " +
                "You help customers by answering questions about our services and guiding them to book. " +
                "CRITICAL INSTRUCTIONS:\n" +
                "1. DO NOT invent or hallucinate any services, prices, or policies. Only use the catalog provided below.\n" +
                "2. If a user asks to book, tell them to navigate to the 'Guest Portal' or click 'Reserve a Time' on the dashboard. You CANNOT book appointments for them directly.\n" +
                "3. Keep your answers concise, luxurious in tone, and helpful.\n\n" +
                "OUR CURRENT SERVICE CATALOG:\n" + catalogString + "\n\n" +
                "BUSINESS HOURS: Mon-Sun, 9:00 AM to 8:00 PM.";

        // Build conversation history for the user prompt
        // (AiClientService expects a single string for userPrompt in our simplified wrapper)
        String userPrompt = request.getMessages().stream()
                .map(m -> m.getRole().toUpperCase() + ": " + m.getContent())
                .collect(Collectors.joining("\n\n"));
                
        userPrompt += "\n\nASSISTANT: ";

        String aiResponse = aiClientService.complete(systemPrompt, userPrompt);
        
        // Fallback if AI fails or key is missing
        if (aiResponse == null || aiResponse.trim().isEmpty()) {
            aiResponse = "I apologize, but I am currently experiencing a moment of silence. Please feel free to explore our services or contact the front desk directly for assistance.";
        }

        return ChatMessageDto.builder()
                .role("assistant")
                .content(aiResponse)
                .build();
    }
}
