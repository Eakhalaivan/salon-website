package com.luxesuite.api.controller;

import com.luxesuite.api.service.SseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class SseController {

    private final SseService sseService;

    @GetMapping("/stream")
    public SseEmitter streamEvents() {
        String clientId = UUID.randomUUID().toString();
        return sseService.subscribe(clientId);
    }
}
