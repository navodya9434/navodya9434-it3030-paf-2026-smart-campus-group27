package com.Authentication.BACKEND.Io;

import com.Authentication.BACKEND.Entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponse {
    private Long id;
    private String userId;
    private String name;
    private String email;
    private Boolean isAccountVerified;
    private Boolean isActive;
    private Role role;
    private String authProvider;
    private Timestamp createdAt;
}
