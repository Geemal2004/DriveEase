package com.driveease.dto;

import com.driveease.enums.AvailabilityStatus;
import com.driveease.enums.VehicleType;
import com.driveease.model.Vehicle;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class VehicleResponse {

    private Long vehicleId;
    private Long contractId;
    private Long providerId;
    private String providerName;
    private VehicleType vehicleType;
    private String registrationNo;
    private String model;
    private String imageUrl;
    private BigDecimal baseDailyRate;
    private Integer allowedMileagePerDay;
    private BigDecimal extraMileageRate;
    private Integer serviceMileageInterval;
    private AvailabilityStatus availabilityStatus;
    private Boolean active;

    public static VehicleResponse fromEntity(Vehicle vehicle) {
        return VehicleResponse.builder()
                .vehicleId(vehicle.getVehicleId())
                .contractId(vehicle.getContract().getContractId())
                .providerId(vehicle.getContract().getProvider().getProviderId())
                .providerName(vehicle.getContract().getProvider().getProviderName())
                .vehicleType(vehicle.getVehicleType())
                .registrationNo(vehicle.getRegistrationNo())
                .model(vehicle.getModel())
                .imageUrl(vehicle.getImageUrl())
                .baseDailyRate(vehicle.getBaseDailyRate())
                .allowedMileagePerDay(vehicle.getAllowedMileagePerDay())
                .extraMileageRate(vehicle.getExtraMileageRate())
                .serviceMileageInterval(vehicle.getServiceMileageInterval())
                .availabilityStatus(vehicle.getAvailabilityStatus())
                .active(vehicle.getActive())
                .build();
    }
}
