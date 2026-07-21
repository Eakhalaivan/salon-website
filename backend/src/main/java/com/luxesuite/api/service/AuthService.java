package com.luxesuite.api.service;

import com.luxesuite.api.dto.AuthResponse;
import com.luxesuite.api.dto.LoginRequest;
import com.luxesuite.api.dto.RegisterRequest;
import com.luxesuite.api.model.Customer;
import com.luxesuite.api.model.Role;
import com.luxesuite.api.model.User;
import com.luxesuite.api.repository.CustomerRepository;
import com.luxesuite.api.repository.RoleRepository;
import com.luxesuite.api.repository.StaffRepository;
import com.luxesuite.api.repository.UserRepository;
import com.luxesuite.api.security.CustomUserDetails;
import com.luxesuite.api.security.JwtService;
import com.luxesuite.api.exception.BadRequestException;
import com.luxesuite.api.exception.ResourceNotFoundException;
import com.luxesuite.api.exception.UnauthorizedException;
import com.luxesuite.api.exception.TooManyRequestsException;
import com.luxesuite.api.exception.ConflictException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CustomerRepository customerRepository;
    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RedisService redisService;
    private final ReferralService referralService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ConflictException("Email already exists");
        }

        if (request.getPhone() != null && !request.getPhone().trim().isEmpty() && userRepository.existsByPhone(request.getPhone())) {
            throw new ConflictException("Phone number already exists");
        }

        if (request.getReferralCode() != null && !request.getReferralCode().trim().isEmpty() && !customerRepository.existsByReferralCode(request.getReferralCode())) {
            throw new BadRequestException("Invalid referral code");
        }

        Role customerRole = roleRepository.findByName("CUSTOMER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("CUSTOMER").build()));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(customerRole)
                .isActive(true)
                .build();
                
        user = userRepository.save(user);

        String newCustomerReferralCode = java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();

        Customer customer = Customer.builder()
                .user(user)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .referralCode(newCustomerReferralCode)
                .build();
                
        customerRepository.save(customer);
        
        if (request.getReferralCode() != null && !request.getReferralCode().trim().isEmpty()) {
            referralService.processReferral(request.getReferralCode(), customer);
        }

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String jwtToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .role(customerRole.getName())
                .customerId(customer.getId())
                .build();
    }

    private void populateUserIds(AuthResponse.AuthResponseBuilder builder, User user) {
        String roleName = user.getRole().getName();
        if ("CUSTOMER".equals(roleName)) {
            customerRepository.findByUserId(user.getId()).ifPresent(c -> builder.customerId(c.getId()));
        } else if (java.util.Set.of("STAFF", "MANAGER", "ADMIN", "RECEPTIONIST", "THERAPIST").contains(roleName)) {
            staffRepository.findByUserId(user.getId()).ifPresent(s -> builder.staffId(s.getId()));
        }
    }

    public AuthResponse authenticate(LoginRequest request) {
        if (redisService.isRateLimited("login:" + request.getEmail(), 5, 15 * 60 * 1000)) {
            throw new TooManyRequestsException("Too many login attempts. Please try again later.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
            );
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
        
        CustomUserDetails userDetails = new CustomUserDetails(user);

        String jwtToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        AuthResponse.AuthResponseBuilder responseBuilder = AuthResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .role(user.getRole().getName())
                .branchId(user.getBranch() != null ? user.getBranch().getId() : null);
        
        populateUserIds(responseBuilder, user);
        
        return responseBuilder.build();
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (redisService.isTokenBlacklisted(refreshToken)) {
            throw new UnauthorizedException("Refresh token is revoked");
        }

        String username = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        CustomUserDetails userDetails = new CustomUserDetails(user);

        if (!jwtService.isTokenValid(refreshToken, userDetails)) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        // Revoke the old refresh token (token rotation)
        redisService.blacklistToken(refreshToken, jwtService.getRefreshExpiration());

        String newAccessToken = jwtService.generateToken(userDetails);
        String newRefreshToken = jwtService.generateRefreshToken(userDetails);

        AuthResponse.AuthResponseBuilder responseBuilder = AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .role(user.getRole().getName())
                .branchId(user.getBranch() != null ? user.getBranch().getId() : null);
                
        populateUserIds(responseBuilder, user);
        
        return responseBuilder.build();
    }

    public void logout(String accessToken, String refreshToken) {
        if (accessToken != null && accessToken.startsWith("Bearer ")) {
            String token = accessToken.substring(7);
            redisService.blacklistToken(token, jwtService.getJwtExpiration());
        }
        if (refreshToken != null) {
            redisService.blacklistToken(refreshToken, jwtService.getRefreshExpiration());
        }
    }
}
