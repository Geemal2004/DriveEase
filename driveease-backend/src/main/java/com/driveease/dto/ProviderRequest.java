package com.driveease.dto;

import com.driveease.enums.AccountStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProviderRequest {

    @NotBlank(message = "Provider name is required")
    private String providerName;

    private String contactPerson;

    private String phone;

    @Email(message = "Invalid email format")
    private String email;

    private String address;

    private AccountStatus status;
}