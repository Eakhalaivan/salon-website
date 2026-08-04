package com.luxesuite.api.config;

import org.springframework.context.annotation.Configuration;
import io.sentry.Sentry;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class SentryConfig {

    private static final Logger logger = LoggerFactory.getLogger(SentryConfig.class);

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
            logger.info("Sentry initialized with DSN from environment.");
        } else {
            logger.warn("SENTRY_DSN is not configured. Sentry will not capture events in this environment.");
        }
    }
}
