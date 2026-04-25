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

    public void updateUserRole(String userId, Role role) {
        UserEntity user = findUserByIdentifier(userId);

        //  prevent changing another admin
        if(user.getRole() == Role.ROLE_ADMIN) {
            throw new RuntimeException("Cannot modify admin");
        }

        user.setRole(role);
        userRepository.save(user);
    }

    public void activateUser(String userId) {
        UserEntity user = findUserByIdentifier(userId);

        if (user.getRole() == Role.ROLE_ADMIN) {
            throw new RuntimeException("Cannot modify admin");
        }

        user.setIsActive(true);
        userRepository.save(user);
    }

    public void deactivateUser(String userId) {
        UserEntity user = findUserByIdentifier(userId);

        if (user.getRole() == Role.ROLE_ADMIN) {
            throw new RuntimeException("Cannot modify admin");
        }

        user.setIsActive(false);
        userRepository.save(user);
    }

    public void deleteUser(String userId) {
        UserEntity user = findUserByIdentifier(userId);

        if (user.getRole() == Role.ROLE_ADMIN) {
            throw new RuntimeException("Cannot delete admin");
        }

        userRepository.delete(user);
    }
}
