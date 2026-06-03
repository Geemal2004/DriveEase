package com.driveease.dto;

public class VehicleMileageUpdate {
    private Long vehicleId;
    private Integer endMileage;

    public Long getVehicleId() {return vehicleId; }
    public void setVehicleId(Long vehicleId) {this.vehicleId = vehicleId; }
    public Integer getEndMileage() {return endMileage; }
    public void setEndMileage(Integer endMileage) {this.endMileage = endMileage; }
}