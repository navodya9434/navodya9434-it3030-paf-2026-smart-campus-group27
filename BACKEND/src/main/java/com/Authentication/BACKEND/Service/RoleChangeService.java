package com.Authentication.BACKEND.Service;

import com.Authentication.BACKEND.Entity.Role;
import com.Authentication.BACKEND.Entity.UserEntity;
import com.Authentication.BACKEND.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoleChangeService {

    private final UserRepository userRepository;

    private UserEntity findUserByIdentifier(String identifier) {
        return userRepository.findByUserId(identifier)
                .orElseGet(() -> {
                    try {
                        long numericId = Long.parseLong(identifier);
                        return userRepository.findById(numericId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                    } catch (NumberFormatException ex) {
                        throw new RuntimeException("User not found");
                    }
                });
    }

   

   
   

  
}
