package com.driveease.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerRequest {

    @NotBlank(message = "Customer full name is required")
    private String fullName;

    private String phone;

    @Email(message = "Invalid email format")
    private String email;

    private String nicOrPassport;

    private String drivingLicenseNo;
}
