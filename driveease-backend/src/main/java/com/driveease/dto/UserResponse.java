package com.driveease.dto;

import com.driveease.enums.AccountStatus;
import com.driveease.enums.UserRole;
import com.driveease.model.AppUser;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserResponse {

    private Long userId;
    private String fullName;
    private String email;
    private UserRole role;
    private AccountStatus status;
    private LocalDateTime createdAt;

    public static UserResponse fromEntity(AppUser user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
