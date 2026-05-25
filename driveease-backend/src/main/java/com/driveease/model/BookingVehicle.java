package com.driveease.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "booking_vehicle")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingVehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingVehicleId;

    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(nullable = false)
    private BigDecimal baseDailyRate;

    @Column(nullable = false)
    private BigDecimal finalDailyRate;

    @Column(nullable = false)
    private BigDecimal lineTotal;
}
