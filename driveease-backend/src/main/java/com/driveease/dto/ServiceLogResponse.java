package com.driveease.dto;

import com.driveease.model.ServiceLog;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder

public class ServiceLogResponse {

    private Long logId;
    private Long vehicleId;
    private String registrationNo;
    private String vehicleModel;
    private String serviceLocation;
    private LocalDate serviceDate;
    private String notes;
    private BigDecimal cost;
    private LocalDateTime createdAt;

    public static ServiceLogResponse fromEntity(ServiceLog serviceLog) {
        return ServiceLogResponse.builder()
                .logId(serviceLog.getLogId())
                .vehicleId(serviceLog.getVehicle().getVehicleId())
                .registrationNo(serviceLog.getVehicle().getRegistrationNo())
                .vehicleModel(serviceLog.getVehicle().getModel())
                .serviceLocation(serviceLog.getServiceLocation())
                .serviceDate(serviceLog.getServiceDate())
                .notes(serviceLog.getNotes())
                .cost(serviceLog.getCost())
                .createdAt(serviceLog.getCreatedAt())
                .build();
    }
}