package com.Authentication.BACKEND.Controller;

import com.Authentication.BACKEND.Entity.Role;
import com.Authentication.BACKEND.Entity.UserEntity;
import com.Authentication.BACKEND.Io.AuthRequest;
import com.Authentication.BACKEND.Io.AuthResponse;
import com.Authentication.BACKEND.Io.ResetPasswordRequest;
import com.Authentication.BACKEND.Repository.UserRepository;
import com.Authentication.BACKEND.Service.AppUserDetailsService;
import com.Authentication.BACKEND.Service.ProfileService;
import com.Authentication.BACKEND.Util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AppUserDetailsService appUserDetailsService;
    private final JwtUtil jwtUtil;
    private final ProfileService profileService;
    private final UserRepository userRepository;

    private String resolveEmailForOtp(String authName, String requestedEmail) {
        if (requestedEmail != null && !requestedEmail.isBlank()) {
            return requestedEmail;
        }

        if (authName == null || authName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing authenticated user");
        }

        if (authName.contains("@")) {
            return authName;
        }

        Optional<UserEntity> byUserId = userRepository.findByUserId(authName);
        if (byUserId.isPresent()) {
            return byUserId.get().getEmail();
        }

        Optional<UserEntity> byEmail = userRepository.findByEmail(authName);
        if (byEmail.isPresent()) {
            return byEmail.get().getEmail();
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to resolve user email for OTP verification");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        return handleLogin(request, false);
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@RequestBody AuthRequest request) {
        return handleLogin(request, true);
    }

    private ResponseEntity<?> handleLogin(AuthRequest request, boolean adminOnly) {
        try {
            UserEntity user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new BadCredentialsException("Email or password is incorrect"));

            if (adminOnly) {
                if (user.getRole() != Role.ROLE_ADMIN) {
                    Map<String, Object> error = new HashMap<>();
                    error.put("error", true);
                    error.put("message", "Only admin email can login here");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
                }
            }

            authenticate(request.getEmail(), request.getPassword());
            final UserDetails userDetails = appUserDetailsService.loadUserByUsername(request.getEmail());
            final String jwtToken = jwtUtil.generateToken(userDetails);
            ResponseCookie cookie = ResponseCookie.from("jwt", jwtToken)
                    .httpOnly(true)
                    .path("/")
                    .maxAge(Duration.ofDays(1))
                    .sameSite("Strict")
                    .build();

                String provider = user.getAuthProvider();
                if (provider == null || provider.isBlank()) {
                provider = "LOCAL";
                }

            return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(new AuthResponse(request.getEmail(), jwtToken, user.getRole().name(), provider.toUpperCase(), user.getIsAccountVerified()));
        } catch (BadCredentialsException ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", "Email or password is incorrect");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (DisabledException ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", "Account disabled");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        } catch (Exception ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", "Authentication Failed");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    private void authenticate(String email, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
    }

    @GetMapping("/is-authenticated")
    public ResponseEntity<Boolean>isAuthenticated(@CurrentSecurityContext(expression = "authentication?.name")String email) {
          return ResponseEntity.ok(email != null);
    }

    @PostMapping("/send-reset-otp")
    public void sendResetOtp(@RequestParam String email) {
          try {
              profileService.sendResetOtp(email);
          } catch (Exception e) {
               throw  new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
          }
    }

        @PostMapping("/reset-password")
        public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
            try {
                profileService.resetPassword(request.getEmail(), request.getOtp(),request.getNewPassword());
            } catch (Exception e) {
                throw  new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
            }
        }

        @PostMapping("/send-otp")
           public void sendVerifyOtp(
                 @CurrentSecurityContext(expression = "authentication?.name") String authName,
                 @RequestParam(required = false) String email
           ) {
            try {
                  profileService.sendOtp(resolveEmailForOtp(authName, email));
            } catch (Exception e) {
                 throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
            }
        }

        @PostMapping("/verify-otp")
           public void verifyEmail(@RequestBody Map<String, Object> request,@CurrentSecurityContext(expression = "authentication?.name")String authName) {
          Object otpValue = request.get("otp");
          if (otpValue == null || otpValue.toString().isBlank()) {
              throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Missing OTP");
        }
             try {
                   String requestedEmail = request.get("email") == null ? null : request.get("email").toString();
                   profileService.verifyOtp(resolveEmailForOtp(authName, requestedEmail), otpValue.toString());
             } catch (Exception e) {
                   throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,e.getMessage());
             }
        }

}
