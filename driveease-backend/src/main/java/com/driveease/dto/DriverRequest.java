package com.driveease.dto;

import com.driveease.enums.DriverStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DriverRequest {

    @NotBlank(message = "Driver full name is required")
    private String fullName;

    private String phone;

    private String nicOrPassport;

    private String drivingLicenseNo;

    private DriverStatus status;
}