package com.driveease.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "customer")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long customerId;

    @Column(nullable = false, length = 100)
    private String fullName;

    private String phone;

    private String email;

    private String nicOrPassport;

    private String drivingLicenseNo;

    private LocalDateTime createdAt = LocalDateTime.now();
}
