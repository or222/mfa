package com.example.mfa.service;

import com.example.mfa.dto.*;
import com.example.mfa.entity.User;
import com.example.mfa.repository.UserRepository;
import com.example.mfa.util.JwtTokenProvider;
import com.example.mfa.util.OtpUtil;
import com.example.mfa.util.PasswordValidator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final OtpUtil otpUtil;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordValidator passwordValidator;

    @Value("${security.login.max-attempts:5}")
    private int maxLoginAttempts;

    @Value("${security.login.lock-duration-minutes:30}")
    private int lockDurationMinutes;

    public AuthService(UserRepository userRepository,
                      PasswordEncoder passwordEncoder,
                      JavaMailSender mailSender,
                      OtpUtil otpUtil,
                      JwtTokenProvider jwtTokenProvider,
                      PasswordValidator passwordValidator) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
        this.otpUtil = otpUtil;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordValidator = passwordValidator;
    }

    @Transactional
    public ApiResponse<String> register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return ApiResponse.error("Email already registered");
        }

        // Validate password
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return ApiResponse.error("Passwords do not match");
        }

        if (!passwordValidator.isValid(request.getPassword())) {
            return ApiResponse.error("Invalid password. " + passwordValidator.getValidationMessage());
        }

        // Create user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEnabled(false);

        userRepository.save(user);

        // Generate and send OTP
        String otp = otpUtil.generateOtp();
        otpUtil.storeOtp(request.getEmail(), otp);
        sendOtpEmail(request.getEmail(), otp, "Registration");

        return ApiResponse.success("Registration successful. Please verify your email with the OTP sent.", null);
    }

    @Transactional
    public ApiResponse<AuthResponse> verifyRegistration(VerifyOtpRequest request) {
        // Verify OTP
        if (!otpUtil.verifyOtp(request.getEmail(), request.getOtp())) {
            return ApiResponse.error("Invalid or expired OTP");
        }

        // Enable user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setEnabled(true);
        user.setFailedLoginAttempts(0);
        user.setLockTime(null);
        userRepository.save(user);

        // Generate tokens
        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        return ApiResponse.success("Email verified successfully", AuthResponse.of(accessToken, refreshToken));
    }

    @Transactional
    public ApiResponse<AuthResponse> login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // Check if account is locked
        if (user.getLockTime() != null) {
            LocalDateTime unlockTime = user.getLockTime().plusMinutes(lockDurationMinutes);
            if (LocalDateTime.now().isBefore(unlockTime)) {
                return ApiResponse.error("Account is locked. Try again after " + 
                    unlockTime.toString());
            } else {
                // Reset lock
                user.setLockTime(null);
                user.setFailedLoginAttempts(0);
                userRepository.save(user);
            }
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            // Increment failed attempts
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            
            if (user.getFailedLoginAttempts() >= maxLoginAttempts) {
                user.setLockTime(LocalDateTime.now());
                userRepository.save(user);
                return ApiResponse.error("Account locked due to too many failed attempts. Try again after " + 
                    lockDurationMinutes + " minutes");
            }
            
            userRepository.save(user);
            return ApiResponse.error("Invalid email or password");
        }

        // Check if user is enabled
        if (!user.isEnabled()) {
            return ApiResponse.error("Please verify your email first");
        }

        // Reset failed attempts on successful login
        user.setFailedLoginAttempts(0);
        user.setLockTime(null);
        userRepository.save(user);

        // Generate tokens
        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        return ApiResponse.success("Login successful", AuthResponse.of(accessToken, refreshToken));
    }

    @Transactional
    public ApiResponse<String> forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        // Always return success to prevent email enumeration
        if (user == null || !user.isEnabled()) {
            return ApiResponse.success("If the email exists, a password reset link has been sent", null);
        }

        // Generate reset token
        String resetToken = otpUtil.generateOtp();
        otpUtil.storePasswordResetToken(request.getEmail(), resetToken);
        sendPasswordResetEmail(request.getEmail(), resetToken);

        return ApiResponse.success("If the email exists, a password reset link has been sent", null);
    }

    @Transactional
    public ApiResponse<String> resetPassword(ResetPasswordRequest request) {
        // Verify reset token
        if (!otpUtil.verifyPasswordResetToken(request.getEmail(), request.getToken())) {
            return ApiResponse.error("Invalid or expired reset token");
        }

        // Validate passwords
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return ApiResponse.error("Passwords do not match");
        }

        if (!passwordValidator.isValid(request.getNewPassword())) {
            return ApiResponse.error("Invalid password. " + passwordValidator.getValidationMessage());
        }

        // Update password
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setFailedLoginAttempts(0);
        user.setLockTime(null);
        userRepository.save(user);

        return ApiResponse.success("Password reset successful", null);
    }

    private void sendOtpEmail(String to, String otp, String purpose) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("MFA - " + purpose + " OTP");
        message.setText("Your OTP for " + purpose + " is: " + otp + 
                       "\n\nThis OTP will expire in 5 minutes.\nDo not share this with anyone.");
        message.setFrom("noreply@mfa-app.com");
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            // Log error but don't fail the operation in development
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    private void sendPasswordResetEmail(String to, String resetToken) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("MFA - Password Reset");
        message.setText("Your password reset token is: " + resetToken + 
                       "\n\nThis token will expire in 5 minutes.\nIf you didn't request this, please ignore this email.");
        message.setFrom("noreply@mfa-app.com");
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }
}
