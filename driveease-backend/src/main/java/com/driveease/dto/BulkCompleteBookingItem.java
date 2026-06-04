package com.driveease.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class BulkCompleteBookingItem {

    @NotNull
    private Long bookingId;

    @Valid
    private List<VehicleMileageUpdate> returnedVehicles;

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public List<VehicleMileageUpdate> getReturnedVehicles() {
        return returnedVehicles;
    }

    public void setReturnedVehicles(List<VehicleMileageUpdate> returnedVehicles) {
        this.returnedVehicles = returnedVehicles;
    }
}
