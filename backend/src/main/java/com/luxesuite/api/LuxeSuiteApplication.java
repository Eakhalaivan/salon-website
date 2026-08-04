package com.luxesuite.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

import org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration;

@SpringBootApplication(exclude = { RedisRepositoriesAutoConfiguration.class })
@EnableCaching
public class LuxeSuiteApplication {

	public static void main(String[] args) {
		SpringApplication.run(LuxeSuiteApplication.class, args);
	}

}
