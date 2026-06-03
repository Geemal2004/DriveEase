package com.driveease.dto;

import com.driveease.enums.VehicleType;
import com.driveease.model.BookingVehicle;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class BookingVehicleResponse {

    private Long bookingVehicleId;
    private Long vehicleId;
    private String registrationNo;
    private String model;
    private VehicleType vehicleType;
    private String providerName;
    private Integer startMileage;
    private Long driverId;
    private String driverName;
    private Integer endMileage;
    private BigDecimal baseDailyRate;
    private BigDecimal finalDailyRate;
    private BigDecimal lineTotal;

    public static BookingVehicleResponse fromEntity(BookingVehicle bookingVehicle) {
        return BookingVehicleResponse.builder()
                .bookingVehicleId(bookingVehicle.getBookingVehicleId())
                .vehicleId(bookingVehicle.getVehicle().getVehicleId())
                .registrationNo(bookingVehicle.getVehicle().getRegistrationNo())
                .model(bookingVehicle.getVehicle().getModel())
                .vehicleType(bookingVehicle.getVehicle().getVehicleType())
                .providerName(bookingVehicle.getVehicle().getContract().getProvider().getProviderName())
                .baseDailyRate(bookingVehicle.getBaseDailyRate())
                .finalDailyRate(bookingVehicle.getFinalDailyRate())
                .lineTotal(bookingVehicle.getLineTotal())
                .driverId(
                    bookingVehicle.getDriver() != null
                    ? bookingVehicle.getDriver().getDriverId()
                    :null
                )
                .driverName(
                    bookingVehicle.getDriver() != null
                    ? bookingVehicle.getDriver().getFullName()
                    :null
                )
                .startMileage(bookingVehicle.getStartMileage())
                .endMileage(bookingVehicle.getEndMileage())
                .build();
    }
}
