package com.Authentication.BACKEND.Io;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {
     private String email;
     private String token;
     private String role;
     private String provider;
     private Boolean isAccountVerified;
}
