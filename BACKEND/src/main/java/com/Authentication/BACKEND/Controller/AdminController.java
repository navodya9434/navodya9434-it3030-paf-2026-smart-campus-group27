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

 
  
   
   

   


}
