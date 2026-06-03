package com.driveease.dto;

import com.driveease.enums.BookingStatus;
import com.driveease.model.Booking;
import com.driveease.model.BookingVehicle;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class BookingResponse {

    private Long bookingId;
    private Long customerId;
    private String customerName;
    private Long createdByUserId;
    private String createdByUserName;
    private LocalDate pickupDate;
    private LocalDate returnDate;
    private Integer rentalDays;
    private Integer strMileage;
    private BigDecimal markupPercentage;
    private BigDecimal extraMileageRate;
    private BigDecimal totalAmount;
    private BookingStatus status;
    private LocalDateTime createdAt;
    private List<BookingVehicleResponse> vehicles;

    public static BookingResponse fromEntity(
            Booking booking,
            List<BookingVehicle> bookingVehicles) {
        return BookingResponse.builder()
                .bookingId(booking.getBookingId())
                .customerId(booking.getCustomer().getCustomerId())
                .customerName(booking.getCustomer().getFullName())
                .createdByUserId(booking.getCreatedBy().getUserId())
                .createdByUserName(booking.getCreatedBy().getFullName())
                .pickupDate(booking.getPickupDate())
                .returnDate(booking.getReturnDate())
                .rentalDays(booking.getRentalDays())
                .markupPercentage(booking.getMarkupPercentage())
                .totalAmount(booking.getTotalAmount())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .vehicles(
                        bookingVehicles.stream()
                                .map(BookingVehicleResponse::fromEntity)
                                .toList())
                .build();
    }
}
