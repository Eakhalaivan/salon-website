package com.luxesuite.api.service;

import com.luxesuite.api.dto.AuthResponse;
import com.luxesuite.api.dto.LoginRequest;
import com.luxesuite.api.dto.ForgotPasswordRequest;
import com.luxesuite.api.dto.ResetPasswordRequest;
import com.luxesuite.api.model.User;
import com.luxesuite.api.repository.UserRepository;
import com.luxesuite.api.repository.CustomerRepository;
import com.luxesuite.api.repository.StaffRepository;
import com.luxesuite.api.security.JwtService;
import com.luxesuite.api.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDateTime;

import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private com.luxesuite.api.service.RedisService redisService;
    
    @Mock
    private EmailService emailService;
    
    @Mock
    private CustomerRepository customerRepository;
    
    @Mock
    private StaffRepository staffRepository;
    
    @Mock
    private ReferralService referralService;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        com.luxesuite.api.model.Role role = new com.luxesuite.api.model.Role();
        role.setId(1L);
        role.setName("CUSTOMER");

        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("encodedPassword");
        testUser.setRole(role);

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");
    }

    @Test
    void testAuthenticate_Success() {
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(testUser));
        when(jwtService.generateToken(any())).thenReturn("accessToken");
        when(jwtService.generateRefreshToken(any())).thenReturn("refreshToken");

        AuthResponse response = authService.authenticate(loginRequest);

        assertNotNull(response);
        assertEquals("accessToken", response.getAccessToken());
        assertEquals("refreshToken", response.getRefreshToken());
        assertEquals("CUSTOMER", response.getRole());

        verify(authenticationManager).authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );
    }
    
    @Test
    void testForgotPassword_Success() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail(testUser.getEmail());
        
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(testUser));
        
        authService.forgotPassword(request);
        
        verify(userRepository).save(any(User.class));
        verify(emailService).sendEmail(eq(testUser.getEmail()), anyString(), anyString());
        assertNotNull(testUser.getResetPasswordToken());
        assertNotNull(testUser.getResetPasswordTokenExpiry());
    }
    
    @Test
    void testResetPassword_Success() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token");
        request.setNewPassword("newPassword123");
        
        testUser.setResetPasswordToken("valid-token");
        testUser.setResetPasswordTokenExpiry(LocalDateTime.now().plusHours(1));
        
        when(userRepository.findAll()).thenReturn(List.of(testUser));
        when(passwordEncoder.encode(request.getNewPassword())).thenReturn("newEncodedHash");
        
        authService.resetPassword(request);
        
        verify(userRepository).save(testUser);
        assertEquals("newEncodedHash", testUser.getPasswordHash());
        assertNull(testUser.getResetPasswordToken());
        assertNull(testUser.getResetPasswordTokenExpiry());
    }
    
    @Test
    void testResetPassword_ExpiredToken() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token");
        request.setNewPassword("newPassword123");
        
        testUser.setResetPasswordToken("valid-token");
        testUser.setResetPasswordTokenExpiry(LocalDateTime.now().minusHours(1)); // Expired
        
        when(userRepository.findAll()).thenReturn(List.of(testUser));
        
        assertThrows(BadRequestException.class, () -> authService.resetPassword(request));
        verify(userRepository, never()).save(any());
    }
}
