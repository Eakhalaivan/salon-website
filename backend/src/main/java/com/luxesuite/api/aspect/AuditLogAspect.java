package com.luxesuite.api.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
public class AuditLogAspect {

    private static final Logger log = LoggerFactory.getLogger(AuditLogAspect.class);

    @Before("execution(* com.luxesuite.api.controller.*.*(..))")
    public void logBeforeRequest(JoinPoint joinPoint) {
        String user = getCurrentUser();
        String method = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        Object[] args = joinPoint.getArgs();
        
        // Exclude sensitive args in real app
        log.info("USER: [{}] | ACTION: {} in {} | ARGS: {}", user, method, className, Arrays.toString(args));
    }

    @AfterReturning(pointcut = "execution(* com.luxesuite.api.controller.*.*(..))", returning = "result")
    public void logAfterRequest(JoinPoint joinPoint, Object result) {
        String user = getCurrentUser();
        String method = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        
        log.info("USER: [{}] | SUCCESS: {} in {}", user, method, className);
    }

    private String getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            return auth.getName();
        }
        return "ANONYMOUS";
    }
}
