package com.driveease.dto;

import com.driveease.enums.AvailabilityStatus;
import com.driveease.enums.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class VehicleRequest {

    @NotNull(message = "Contract ID is required")
    private Long contractId;

    @NotNull(message = "Vehicle type is required")
    private VehicleType vehicleType;

    @NotBlank(message = "Registration number is required")
    private String registrationNo;

    private String model;

    private String imageUrl;

    @NotNull(message = "Base daily rate is required")
    @Positive(message = "Base daily rate must be greater than zero")
    private BigDecimal baseDailyRate;

    private Integer allowedMileagePerDay;

    private AvailabilityStatus availabilityStatus;

    private Boolean active;
}
