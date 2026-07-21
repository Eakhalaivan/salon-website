package com.luxesuite.api.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import io.sentry.Sentry;

import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisService {

    private final StringRedisTemplate redisTemplate;

    public void blacklistToken(String token, long expirationMs) {
        try {
            redisTemplate.opsForValue().set("blacklist:" + token, "revoked", expirationMs, TimeUnit.MILLISECONDS);
        } catch (Exception e) {
            log.error("Redis is unavailable, failed to blacklist token.", e);
            Sentry.captureException(e);
            throw new RuntimeException("Service temporarily unavailable. Please try again later.");
        }
    }

    public boolean isTokenBlacklisted(String token) {
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey("blacklist:" + token));
        } catch (Exception e) {
            log.error("Redis is unavailable, failing open on token blacklist check.", e);
            Sentry.captureException(e);
            return false; // fail open for local dev without Redis
        }
    }

    public boolean isRateLimited(String key, int maxRequests, long timeWindowMs) {
        try {
            String redisKey = "rate_limit:" + key;
            Long requests = redisTemplate.opsForValue().increment(redisKey);
            
            if (requests != null && requests == 1) {
                redisTemplate.expire(redisKey, timeWindowMs, TimeUnit.MILLISECONDS);
            }
            
            return requests != null && requests > maxRequests;
        } catch (Exception e) {
            log.error("Redis is unavailable, failing open on rate limit check.", e);
            Sentry.captureException(e);
            return false; // fail open for local dev without Redis
        }
    }
}
