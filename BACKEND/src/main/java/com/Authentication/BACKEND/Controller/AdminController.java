package com.Authentication.BACKEND.Controller;

import com.Authentication.BACKEND.Entity.Role;
import com.Authentication.BACKEND.Service.RoleChangeService;
import com.Authentication.BACKEND.Repository.UserRepository;
import com.Authentication.BACKEND.Io.AdminUserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.Authentication.BACKEND.Entity.UserEntity;
import java.util.List;
import java.util.Locale;


@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final RoleChangeService roleChangeService;
    private final UserRepository userRepository;

    @PutMapping("/promote/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> promoteUser(@PathVariable String userId,
                              @RequestParam Role role) {
        try {
            roleChangeService.updateUserRole(userId, role);
            return ResponseEntity.ok("User promoted successfully");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToAdminUserResponse)
                .toList();
    }

    private AdminUserResponse mapToAdminUserResponse(UserEntity user) {
        String provider = user.getAuthProvider();
        if (provider == null || provider.isBlank()) {
            provider = "LOCAL";
        }

        return AdminUserResponse.builder()
                .id(user.getId())
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .isAccountVerified(user.getIsAccountVerified())
                .isActive(user.getIsActive())
                .role(user.getRole())
                .authProvider(provider.toUpperCase(Locale.ROOT))
                .createdAt(user.getCreatedAt())
                .build();
    }

    @PutMapping("/users/{userId}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> activateUser(@PathVariable String userId) {
        try {
            roleChangeService.activateUser(userId);
            return ResponseEntity.ok("User activated successfully");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PutMapping("/users/{userId}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deactivateUser(@PathVariable String userId) {
        try {
            roleChangeService.deactivateUser(userId);
            return ResponseEntity.ok("User deactivated successfully");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable String userId) {
        try {
            roleChangeService.deleteUser(userId);
            return ResponseEntity.ok("User deleted successfully");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


}
