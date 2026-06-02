package com.example.mfa.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;

@Data
public class VerifyOtpRequest {

    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "OTP is required")
    private String otp;
}
