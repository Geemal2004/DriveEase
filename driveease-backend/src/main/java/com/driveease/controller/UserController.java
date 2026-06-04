package com.driveease.controller;

import com.driveease.dto.auth.MessageResponse;
import com.driveease.dto.auth.SignupRequest;
import com.driveease.dto.UserResponse;
import com.driveease.enums.AccountStatus;
import com.driveease.enums.UserRole;
import com.driveease.model.AppUser;
import com.driveease.repository.AppUserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class UserController {

    private final AppUserRepository userRepository;
    private final PasswordEncoder encoder;

    public UserController(AppUserRepository userRepository, PasswordEncoder encoder) {
        this.userRepository = userRepository;
        this.encoder = encoder;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(AppUser::getUserId))
                .map(UserResponse::fromEntity)
                .toList();
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        UserRole role;
        try {
            role = UserRole.valueOf(signUpRequest.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid role specified."));
        }

        AppUser user = AppUser.builder()
                .fullName(signUpRequest.getFullName())
                .email(signUpRequest.getEmail())
                .passwordHash(encoder.encode(signUpRequest.getPassword()))
                .role(role)
                .status(AccountStatus.ACTIVE)
                .build();

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
