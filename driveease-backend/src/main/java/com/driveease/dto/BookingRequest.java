package com.driveease.dto;

import com.driveease.enums.BookingStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class BookingRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Created by user ID is required")
    private Long createdByUserId;

    @NotNull(message = "Pickup date is required")
    private LocalDate pickupDate;

    @NotNull(message = "Rental days is required")
    @Positive(message = "Rental days must be greater than zero")
    private Integer rentalDays;

    @Valid
    @NotEmpty(message = "At least one vehicle must be selected")
    private List<BookingVehicleRequest> vehicles;

    private BookingStatus status;
}
