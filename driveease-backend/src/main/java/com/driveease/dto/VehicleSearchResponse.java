package com.driveease.dto;

import com.driveease.enums.AvailabilityStatus;
import com.driveease.enums.VehicleType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class VehicleSearchResponse {

    private Long vehicleId;
    private String providerName;
    private VehicleType vehicleType;
    private String registrationNo;
    private String model;
    private BigDecimal baseDailyRate;
    private BigDecimal finalDailyRate;
    private Integer rentalDays;
    private Integer numberOfVehicles;
    private BigDecimal totalPrice;
    private Integer allowedMileagePerDay;
    private AvailabilityStatus availabilityStatus;
}
