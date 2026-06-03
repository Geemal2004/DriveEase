package com.driveease.model;

import com.driveease.enums.AvailabilityStatus;
import com.driveease.enums.VehicleType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "vehicle")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long vehicleId;

    @ManyToOne
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType vehicleType;

    @Column(nullable = false, unique = true)
    private String registrationNo;

    private String model;

    @Column(length = 500)
    private String imageUrl;

    @Column(nullable = false)
    private BigDecimal baseDailyRate;

    private BigDecimal extraMileageRate = BigDecimal.ZERO;

    private Integer allowedMileagePerDay;

    private Integer serviceMileageInterval;

    @Enumerated(EnumType.STRING)
    private AvailabilityStatus availabilityStatus = AvailabilityStatus.AVAILABLE;

    private Boolean active = true;

}
