package com.quizbattle.backend.controller;

import com.quizbattle.backend.dto.UserRegisterRequest;
import com.quizbattle.backend.dto.UserResponse;
import com.quizbattle.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody UserRegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.registerUser(req));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserResponse> getByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }
}