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

    @Override
    public void sendResetOtp(String email) {
    UserEntity existingEntity = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found : " + email));

    //Generate 6 digit otp
        String otp = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));


        //calculate expiry time(current time + 10 minutes in milliseconds)
     long expiryTime = System.currentTimeMillis() + (10 * 60 * 1000);

     //update user entity with otp and expiry time
     existingEntity.setResetOtp(otp);
     existingEntity.setResetOtpExpiredAt(expiryTime);
     userRepository.save(existingEntity);

      try {
            //send otp to user email
            emailService.sendResetOtpEmail(existingEntity.getEmail(), otp);

        } catch (Exception e) {
            throw new RuntimeException("Failed to send OTP email");
      }
    }

    @Override
    public void resetPassword(String email, String otp, String newPassword) {
        UserEntity existingUser =  userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found : " + email));

        if(existingUser.getResetOtp() == null || !existingUser.getResetOtp().equals(otp)) {
             throw new RuntimeException("Invalid OTP");
        }
        if (existingUser.getResetOtpExpiredAt() < System.currentTimeMillis()) {
            throw new RuntimeException("OTP has expired");
        }
        existingUser.setPassword(passwordEncoder.encode(newPassword));
        existingUser.setResetOtp(null);
        existingUser.setResetOtpExpiredAt(0L);

        userRepository.save(existingUser);
    }

    @Override
    public void sendOtp(String email) {
        UserEntity existingUser =   userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found " + email));

        if(existingUser.getIsAccountVerified() != null && existingUser.getIsAccountVerified()){
             return;
        }
        //Generate 6 digit otp
        String otp = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));


        //calculate expiry time(current time + 24 hours in milliseconds)
        long expiryTime = System.currentTimeMillis() + (24 * 60 * 60 * 1000);

        //Update the user entity
        existingUser.setVerifyOtp(otp);
        existingUser.setVerifyOtpExpiredAt(expiryTime);
        userRepository.save(existingUser);

        try {
             emailService.sendAccountVerificationEmail(existingUser.getEmail(),otp);
        } catch (Exception e) {
             throw new RuntimeException("Failed to send account verification email");
        }

    }

    @Override
    public void verifyOtp(String email, String otp) {

        UserEntity existingUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        // Check OTP valid or not
        if (existingUser.getVerifyOtp() == null || !existingUser.getVerifyOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        // Check expiry
        if (existingUser.getVerifyOtpExpiredAt() < System.currentTimeMillis()) {
            throw new RuntimeException("OTP Expired");
        }

        // Mark as verified
        existingUser.setIsAccountVerified(true);
        existingUser.setVerifyOtp(null);
        existingUser.setVerifyOtpExpiredAt(0L);

        userRepository.save(existingUser);
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
