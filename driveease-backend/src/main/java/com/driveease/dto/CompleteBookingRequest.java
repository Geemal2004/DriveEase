package com.driveease.dto;

import java.util.List;

public class CompleteBookingRequest {
    private List<VehicleMileageUpdate> returnedVehicles;

    // Getters and Setters
    public List<VehicleMileageUpdate> getReturnedVehicles() { return returnedVehicles; }
    public void setReturnedVehicles(List<VehicleMileageUpdate> returnedVehicles) { this.returnedVehicles = returnedVehicles; }
}