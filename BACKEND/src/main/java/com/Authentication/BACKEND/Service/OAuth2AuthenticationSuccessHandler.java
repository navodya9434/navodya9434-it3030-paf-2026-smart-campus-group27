package com.Authentication.BACKEND.Service;

import com.Authentication.BACKEND.Entity.Role;
import com.Authentication.BACKEND.Entity.UserEntity;
import com.Authentication.BACKEND.Repository.UserRepository;
import com.Authentication.BACKEND.Util.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${app.frontend.oauth2.redirect-url:http://localhost:5173/oauth2/success}")
    private String frontendRedirectUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        String email = getStringAttribute(oauth2User, "email");
        if (email == null || email.isBlank()) {
            response.sendRedirect(frontendRedirectUrl + "?error=google_email_not_found");
            return;
        }

        String googleId = Optional.ofNullable(getStringAttribute(oauth2User, "sub"))
                .orElse(getStringAttribute(oauth2User, "id"));

        String name = Optional.ofNullable(getStringAttribute(oauth2User, "name"))
                .filter(value -> !value.isBlank())
                .orElseGet(() -> email.split("@")[0]);

        UserEntity userEntity = userRepository.findByEmail(email)
                .map(existingUser -> updateExistingOAuthUser(existingUser, name))
                .orElseGet(() -> createNewOAuthUser(email, name));

        UserDetails userDetails = new User(
                userEntity.getEmail(),
                userEntity.getPassword(),
                List.of(new SimpleGrantedAuthority(userEntity.getRole().name()))
        );

        String jwtToken = jwtUtil.generateToken(userDetails);

        ResponseCookie cookie = ResponseCookie.from("jwt", jwtToken)
                .httpOnly(true)
                .path("/")
                .maxAge(Duration.ofDays(1))
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        String redirectUrl = UriComponentsBuilder.fromUriString(frontendRedirectUrl)
                .queryParam("token", jwtToken)
                .queryParam("email", userEntity.getEmail())
                .queryParam("role", userEntity.getRole().name())
            .queryParam("provider", Optional.ofNullable(userEntity.getAuthProvider()).orElse("GOOGLE").toUpperCase())
            .queryParam("name", userEntity.getName())
            .queryParamIfPresent("googleId", Optional.ofNullable(googleId))
                .build()
                .toUriString();

        response.sendRedirect(redirectUrl);
    }

    private String getStringAttribute(OAuth2User oauth2User, String key) {
        Object value = oauth2User.getAttributes().get(key);
        if (value == null) {
            return null;
        }

        String stringValue = String.valueOf(value).trim();
        return stringValue.isEmpty() ? null : stringValue;
    }

    private UserEntity updateExistingOAuthUser(UserEntity existingUser, String fallbackName) {
        boolean changed = false;

        if (existingUser.getPassword() == null || existingUser.getPassword().isBlank()) {
            existingUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            changed = true;
        }

        if (existingUser.getRole() == null) {
            existingUser.setRole(Role.ROLE_USER);
            changed = true;
        }

        if (existingUser.getUserId() == null || existingUser.getUserId().isBlank()) {
            existingUser.setUserId(UUID.randomUUID().toString());
            changed = true;
        }

        if (existingUser.getName() == null || existingUser.getName().isBlank()) {
            existingUser.setName(fallbackName);
            changed = true;
        }

        if (existingUser.getIsActive() == null || !existingUser.getIsActive()) {
            existingUser.setIsActive(true);
            changed = true;
        }

        if (existingUser.getIsAccountVerified() == null || !existingUser.getIsAccountVerified()) {
            existingUser.setIsAccountVerified(true);
            changed = true;
        }

        String provider = existingUser.getAuthProvider();
        if (provider == null || provider.isBlank() || "LOCAL".equalsIgnoreCase(provider)) {
            existingUser.setAuthProvider("GOOGLE");
            changed = true;
        }

        if (changed) {
            return userRepository.save(existingUser);
        }

        return existingUser;
    }

    private UserEntity createNewOAuthUser(String email, String name) {
        UserEntity newUser = UserEntity.builder()
                .email(email)
                .name(name)
                .userId(UUID.randomUUID().toString())
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .authProvider("GOOGLE")
                .role(Role.ROLE_USER)
                .isActive(true)
                .isAccountVerified(true)
                .resetOtp(null)
                .resetOtpExpiredAt(0L)
                .verifyOtp(null)
                .verifyOtpExpiredAt(0L)
                .build();

        return userRepository.save(newUser);
    }
}
