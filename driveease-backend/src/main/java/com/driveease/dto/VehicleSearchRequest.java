package com.driveease.dto;

import com.driveease.enums.VehicleType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class VehicleSearchRequest {

    @NotNull(message = "Pickup date is required")
    private LocalDate pickupDate;

    @NotNull(message = "Number of rental days is required")
    @Positive(message = "Rental days must be greater than zero")
    private Integer rentalDays;

    @NotNull(message = "Number of vehicles is required")
    @Positive(message = "Number of vehicles must be greater than zero")
    private Integer numberOfVehicles;

    @NotNull(message = "Vehicle type is required")
    private VehicleType vehicleType;
}
