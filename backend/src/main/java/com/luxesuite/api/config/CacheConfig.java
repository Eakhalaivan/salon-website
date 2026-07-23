package com.luxesuite.api.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.cache.support.CompositeCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.cache.RedisCacheWriter;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.cache.interceptor.SimpleCacheErrorHandler;
import org.springframework.cache.Cache;

@Slf4j
@Configuration
@EnableCaching
public class CacheConfig implements CachingConfigurer {

    @Override
    public CacheErrorHandler errorHandler() {
        return new SimpleCacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Cache Get Error for key {}: {}", key, exception.getMessage());
            }

            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
                log.warn("Cache Put Error for key {}: {}", key, exception.getMessage());
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Cache Evict Error for key {}: {}", key, exception.getMessage());
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                log.warn("Cache Clear Error: {}", exception.getMessage());
            }
        };
    }


    /**
     * Builds a composite CacheManager:
     * 1. First tries Redis (with a non-locking writer that doesn't block on slow Redis).
     * 2. Falls back to an in-memory ConcurrentMapCacheManager when Redis is unavailable.
     *
     * This means the app works fully in local dev without Redis running.
     */
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(5))
                .serializeKeysWith(
                    RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(
                    RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));

        // Non-locking writer — does not block waiting for Redis lock
        RedisCacheWriter cacheWriter = RedisCacheWriter.nonLockingRedisCacheWriter(connectionFactory);

        RedisCacheManager redisCacheManager = RedisCacheManager.builder(cacheWriter)
                .cacheDefaults(config)
                .build();

        // In-memory fallback for when Redis is down in local dev
        ConcurrentMapCacheManager fallbackCacheManager = new ConcurrentMapCacheManager();
        fallbackCacheManager.setAllowNullValues(true);

        // CompositeCacheManager: tries Redis first, falls back to in-memory
        CompositeCacheManager composite = new CompositeCacheManager(redisCacheManager, fallbackCacheManager);
        composite.setFallbackToNoOpCache(true);
        return composite;
    }
}
