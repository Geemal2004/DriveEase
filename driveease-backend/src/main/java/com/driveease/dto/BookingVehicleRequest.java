package com.driveease.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingVehicleRequest {
    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    private Long driverId;

    private Integer startMileage;

    private Integer endMileage;

}
