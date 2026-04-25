package com.Authentication.BACKEND.Service;

import com.Authentication.BACKEND.Entity.Role;
import com.Authentication.BACKEND.Entity.UserEntity;
import com.Authentication.BACKEND.Io.ProfileRequest;
import com.Authentication.BACKEND.Io.ProfileResponse;
import com.Authentication.BACKEND.Repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public ProfileServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Override
    public ProfileResponse createProfile(ProfileRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        UserEntity newProfile = convertToUserEntity(request);
        newProfile = userRepository.save(newProfile);

        return convertToProfileResponse(newProfile);
    }

   
  @Override
    public ProfileResponse getProfile(String email) {
      UserEntity existingUser =   userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found :" + email));

      return convertToProfileResponse(existingUser);
    }

     





   

   
      
   
    

    private ProfileResponse convertToProfileResponse(UserEntity newProfile) {
        return ProfileResponse.builder()
                .name(newProfile.getName())
                .email(newProfile.getEmail())
                .userId(newProfile.getUserId())
                .isAccountVerified(newProfile.getIsAccountVerified())
                .build();
    }

    private UserEntity convertToUserEntity(ProfileRequest request) {
        return UserEntity.builder()
                .email(request.getEmail())
                .userId(UUID.randomUUID().toString())
                .name(request.getName())
                .password(passwordEncoder.encode(request.getPassword()))
                .authProvider("LOCAL")
                .role(Role.ROLE_USER)
            .isActive(true)
                .isAccountVerified(false)
                .resetOtpExpiredAt(0L)
                .verifyOtp(null)
                .verifyOtpExpiredAt(0L)
                .resetOtp(null)
                .build();
    }
}
