package com.example.mfa.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class PasswordValidator {

    @Value("${password.min-length:8}")
    private int minLength;

    @Value("${password.require-uppercase:true}")
    private boolean requireUppercase;

    @Value("${password.require-lowercase:true}")
    private boolean requireLowercase;

    @Value("${password.require-digit:true}")
    private boolean requireDigit;

    @Value("${password.require-special-char:true}")
    private boolean requireSpecialChar;

    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile("[^a-zA-Z0-9]");

    public boolean isValid(String password) {
        if (password == null || password.isEmpty()) {
            return false;
        }

        if (password.length() < minLength) {
            return false;
        }

        if (requireUppercase && !containsUppercase(password)) {
            return false;
        }

        if (requireLowercase && !containsLowercase(password)) {
            return false;
        }

        if (requireDigit && !containsDigit(password)) {
            return false;
        }

        if (requireSpecialChar && !containsSpecialChar(password)) {
            return false;
        }

        return true;
    }

    public String getValidationMessage() {
        StringBuilder message = new StringBuilder("Password must:");
        message.append("\n- Be at least ").append(minLength).append(" characters long");

        if (requireUppercase) {
            message.append("\n- Contain at least one uppercase letter");
        }

        if (requireLowercase) {
            message.append("\n- Contain at least one lowercase letter");
        }

        if (requireDigit) {
            message.append("\n- Contain at least one digit");
        }

        if (requireSpecialChar) {
            message.append("\n- Contain at least one special character");
        }

        return message.toString();
    }

    private boolean containsUppercase(String password) {
        return !password.equals(password.toLowerCase());
    }

    private boolean containsLowercase(String password) {
        return !password.equals(password.toUpperCase());
    }

    private boolean containsDigit(String password) {
        for (char c : password.toCharArray()) {
            if (Character.isDigit(c)) {
                return true;
            }
        }
        return false;
    }

    private boolean containsSpecialChar(String password) {
        return SPECIAL_CHAR_PATTERN.matcher(password).find();
    }
}
