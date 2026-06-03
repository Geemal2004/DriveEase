package com.driveease.dto;

import com.driveease.enums.DriverStatus;
import com.driveease.model.Driver;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class DriverResponse {

    private Long driverId;
    private String fullName;
    private String phone;
    private String nicOrPassport;
    private String drivingLicenseNo;
    private DriverStatus status;
    private LocalDateTime createdAt;

    public static DriverResponse fromEntity(Driver driver) {
        return DriverResponse.builder()
                .driverId(driver.getDriverId())
                .fullName(driver.getFullName())
                .phone(driver.getPhone())
                .nicOrPassport(driver.getNicOrPassport())
                .drivingLicenseNo(driver.getDrivingLicenseNo())
                .status(driver.getStatus())
                .createdAt(driver.getCreatedAt())
                .build();
    }
}