package com.luxesuite.api.controller;

import com.luxesuite.api.dto.ChatMessageDto;
import com.luxesuite.api.dto.ChatRequestDto;
import com.luxesuite.api.service.ai.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatbotService chatbotService;

    @PostMapping("/assistant")
    public ResponseEntity<ChatMessageDto> chat(@RequestBody ChatRequestDto request) {
        return ResponseEntity.ok(chatbotService.chat(request));
    }
}
