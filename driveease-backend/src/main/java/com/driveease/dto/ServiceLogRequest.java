package com.driveease.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.math.BigDecimal;

@Getter
@Setter
public class ServiceLogRequest {

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    private String serviceLocation;

    @NotNull(message = "Service date is required")
    private LocalDate serviceDate; 

    private String notes;

    private BigDecimal cost;

}