package com.luxesuite.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/v1/system")
public class SystemController {

    @GetMapping("/sentry-test")
    public ResponseEntity<String> sentryTest() {
        try {
            throw new RuntimeException("This is a test exception for Sentry configuration verification.");
        } catch (Exception e) {
            io.sentry.Sentry.captureException(e);
            return ResponseEntity.ok("Test exception captured by Sentry (if configured).");
        }
    }
}
