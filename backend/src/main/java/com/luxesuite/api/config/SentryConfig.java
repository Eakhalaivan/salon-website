package com.luxesuite.api.config;

import org.springframework.context.annotation.Configuration;
import io.sentry.Sentry;
import jakarta.annotation.PostConstruct;

@Configuration
public class SentryConfig {

    @PostConstruct
    public void init() {
        // In a real environment, this DSN would be loaded from application.yml
        // For example: sentry.dsn=https://examplePublicKey@o0.ingest.sentry.io/0
        String sentryDsn = System.getenv("SENTRY_DSN");
        
        if (sentryDsn != null && !sentryDsn.isEmpty()) {
            Sentry.init(options -> {
                options.setDsn(sentryDsn);
                // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
                options.setTracesSampleRate(1.0);
            });
        }
    }
}
