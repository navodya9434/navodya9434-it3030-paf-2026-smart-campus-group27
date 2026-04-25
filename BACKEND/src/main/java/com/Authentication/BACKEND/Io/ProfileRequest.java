package com.Authentication.BACKEND.Io;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;


@Data
@AllArgsConstructor
public class ProfileRequest {

    @NotBlank(message = "Name cannot be blank")
    private String name;
    @Email(message = "Email should be valid")
    @NotNull(message = "Email cannot be null")
    private String email;
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;
}
