package com.example.mfa.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.security.SecureRandom;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Component
public class OtpUtil {

    private final StringRedisTemplate redisTemplate;

    @Value("${security.otp.length}")
    private int otpLength;

    @Value("${security.otp.expiration-seconds}")
    private long otpExpirationSeconds;

    private static final SecureRandom secureRandom = new SecureRandom();
    private static final String OTP_CHARS = "0123456789";

    public OtpUtil(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public String generateOtp() {
        StringBuilder otp = new StringBuilder(otpLength);
        for (int i = 0; i < otpLength; i++) {
            otp.append(OTP_CHARS.charAt(secureRandom.nextInt(OTP_CHARS.length())));
        }
        return otp.toString();
    }

    public void storeOtp(String email, String otp) {
        String key = "otp:" + email.toLowerCase();
        redisTemplate.opsForValue().set(key, otp, otpExpirationSeconds, TimeUnit.SECONDS);
    }

    public boolean verifyOtp(String email, String otp) {
        String key = "otp:" + email.toLowerCase();
        String storedOtp = redisTemplate.opsForValue().get(key);
        
        if (storedOtp != null && storedOtp.equals(otp)) {
            redisTemplate.delete(key);
            return true;
        }
        return false;
    }

    public void deleteOtp(String email) {
        String key = "otp:" + email.toLowerCase();
        redisTemplate.delete(key);
    }

    public void storePasswordResetToken(String email, String token) {
        String key = "pwd_reset:" + email.toLowerCase();
        redisTemplate.opsForValue().set(key, token, otpExpirationSeconds, TimeUnit.SECONDS);
    }

    public boolean verifyPasswordResetToken(String email, String token) {
        String key = "pwd_reset:" + email.toLowerCase();
        String storedToken = redisTemplate.opsForValue().get(key);
        
        if (storedToken != null && storedToken.equals(token)) {
            redisTemplate.delete(key);
            return true;
        }
        return false;
    }

    public void deletePasswordResetToken(String email) {
        String key = "pwd_reset:" + email.toLowerCase();
        redisTemplate.delete(key);
    }
}
