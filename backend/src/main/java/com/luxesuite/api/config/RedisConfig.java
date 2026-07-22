package com.luxesuite.api.config;

import io.github.bucket4j.redis.lettuce.cas.LettuceBasedProxyManager;
import io.lettuce.core.RedisClient;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.codec.ByteArrayCodec;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.beans.factory.annotation.Value;

import java.time.Duration;

@Configuration
public class RedisConfig {



    @Bean
    public RedisClient redisClient(@Value("${spring.data.redis.url}") String redisUrl) {
        return RedisClient.create(redisUrl);
    }

    @Bean
    public LettuceBasedProxyManager<byte[]> lettuceProxyManager(RedisClient redisClient) {
        StatefulRedisConnection<byte[], byte[]> connection = redisClient.connect(ByteArrayCodec.INSTANCE);
        return LettuceBasedProxyManager.builderFor(connection)
                .withExpirationStrategy(
                        io.github.bucket4j.distributed.ExpirationAfterWriteStrategy.basedOnTimeForRefillingBucketUpToMax(Duration.ofSeconds(10))
                )
                .build();
    }
}
