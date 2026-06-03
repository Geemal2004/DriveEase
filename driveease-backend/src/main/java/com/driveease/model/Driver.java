package com.driveease.model;

import com.driveease.enums.DriverStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "driver")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long driverId;

    @Column(nullable = false, length = 100)
    private String fullName;

    private String phone;

    private String nicOrPassport;

    private String drivingLicenseNo;

    @Enumerated(EnumType.STRING)
    private DriverStatus status = DriverStatus.ACTIVE;

    private LocalDateTime createdAt = LocalDateTime.now();
}