package com.Authentication.BACKEND.Io;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResetPasswordRequest {

    @NotBlank(message = "New password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
     private String newPassword;
    @NotBlank(message = "OTP is required")
     private String otp;
    @NotBlank(message = "Email is required")
     private String email;
}
