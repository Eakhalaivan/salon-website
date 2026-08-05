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
        // We use a custom FailSafeCacheManager to catch Redis exceptions and fallback seamlessly
        return new FailSafeCacheManager(redisCacheManager, fallbackCacheManager);
    }

    private static class FailSafeCacheManager implements CacheManager {
        private final CacheManager primary;
        private final CacheManager fallback;

        public FailSafeCacheManager(CacheManager primary, CacheManager fallback) {
            this.primary = primary;
            this.fallback = fallback;
        }

        @Override
        public Cache getCache(String name) {
            Cache primaryCache = primary != null ? primary.getCache(name) : null;
            Cache fallbackCache = fallback != null ? fallback.getCache(name) : null;
            if (primaryCache == null && fallbackCache == null) return null;
            return new FailSafeCache(primaryCache, fallbackCache);
        }

        @Override
        public java.util.Collection<String> getCacheNames() {
            return primary != null ? primary.getCacheNames() : java.util.Collections.emptyList();
        }
    }

    private static class FailSafeCache implements Cache {
        private final Cache primary;
        private final Cache fallback;

        public FailSafeCache(Cache primary, Cache fallback) {
            this.primary = primary;
            this.fallback = fallback;
        }

        @Override
        public String getName() {
            return primary != null ? primary.getName() : fallback.getName();
        }

        @Override
        public Object getNativeCache() {
            return primary != null ? primary.getNativeCache() : fallback.getNativeCache();
        }

        @Override
        public ValueWrapper get(Object key) {
            if (primary != null) {
                try { return primary.get(key); }
                catch (Exception e) { log.warn("Redis GET failed: {}", e.getMessage()); }
            }
            return fallback != null ? fallback.get(key) : null;
        }

        @Override
        public <T> T get(Object key, Class<T> type) {
            if (primary != null) {
                try { return primary.get(key, type); }
                catch (Exception e) { log.warn("Redis GET failed: {}", e.getMessage()); }
            }
            return fallback != null ? fallback.get(key, type) : null;
        }

        @Override
        public <T> T get(Object key, java.util.concurrent.Callable<T> valueLoader) {
            if (primary != null) {
                try { return primary.get(key, valueLoader); }
                catch (Exception e) { log.warn("Redis GET failed: {}", e.getMessage()); }
            }
            return fallback != null ? fallback.get(key, valueLoader) : null;
        }

        @Override
        public void put(Object key, Object value) {
            if (primary != null) {
                try { primary.put(key, value); }
                catch (Exception e) { log.warn("Redis PUT failed: {}", e.getMessage()); }
            }
            if (fallback != null) fallback.put(key, value);
        }

        @Override
        public ValueWrapper putIfAbsent(Object key, Object value) {
            if (primary != null) {
                try { return primary.putIfAbsent(key, value); }
                catch (Exception e) { log.warn("Redis PUT failed: {}", e.getMessage()); }
            }
            return fallback != null ? fallback.putIfAbsent(key, value) : null;
        }

        @Override
        public void evict(Object key) {
            if (primary != null) {
                try { primary.evict(key); }
                catch (Exception e) { log.warn("Redis EVICT failed: {}", e.getMessage()); }
            }
            if (fallback != null) fallback.evict(key);
        }

        @Override
        public void clear() {
            if (primary != null) {
                try { primary.clear(); }
                catch (Exception e) { log.warn("Redis CLEAR failed: {}", e.getMessage()); }
            }
            if (fallback != null) fallback.clear();
        }
    }
}
