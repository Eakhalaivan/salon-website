package com.luxesuite.api.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Order(1) // High precedence
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (request.getRequestURI().startsWith("/api/")) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String clientId = getClientId(authentication, request);
            
            Bucket bucket = buckets.computeIfAbsent(clientId, k -> {
                BucketConfiguration config = getBucketConfigurationForUser();
                return Bucket.builder()
                        .addLimit(config.getBandwidths()[0])
                        .build();
            });

            if (bucket.tryConsume(1)) {
                filterChain.doFilter(request, response);
            } else {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("Too many requests");
                return;
            }
        } else {
            filterChain.doFilter(request, response);
        }
    }

    private String getClientId(Authentication auth, HttpServletRequest request) {
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            return auth.getName(); // User email/username
        }
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return (ip != null && !ip.isEmpty()) ? ip : "unknown-client";
    }

    private BucketConfiguration getBucketConfigurationForUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        int limit = 100; // Default limit for unauthenticated or normal users (100 req/min)
        if (auth != null && auth.isAuthenticated()) {
            Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
            boolean isAdmin = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            boolean isManager = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER"));
            
            if (isAdmin) {
                limit = 1000; // Admins get 1000 req/min
            } else if (isManager) {
                limit = 500; // Managers get 500 req/min
            }
        }
        
        Refill refill = Refill.greedy(limit, Duration.ofMinutes(1));
        Bandwidth limitBandwidth = Bandwidth.classic(limit, refill);
        return BucketConfiguration.builder().addLimit(limitBandwidth).build();
    }
}
