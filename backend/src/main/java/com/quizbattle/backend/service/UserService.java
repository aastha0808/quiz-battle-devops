package com.quizbattle.backend.service;

import com.quizbattle.backend.dto.UserRegisterRequest;
import com.quizbattle.backend.dto.UserResponse;
import com.quizbattle.backend.entity.User;
import com.quizbattle.backend.exception.DuplicateResourceException;
import com.quizbattle.backend.exception.ResourceNotFoundException;
import com.quizbattle.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse registerUser(UserRegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + req.getEmail());
        }
        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPassword(req.getPassword()); // hash this with BCrypt before going to production
        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return toResponse(user);
    }

    // Reusable internally by other services that need a full User entity
    public User getEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail());
    }
}