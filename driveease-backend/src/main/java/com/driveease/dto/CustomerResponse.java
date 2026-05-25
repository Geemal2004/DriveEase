package com.driveease.dto;

import com.driveease.model.Customer;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CustomerResponse {

    private Long customerId;
    private String fullName;
    private String phone;
    private String email;
    private String nicOrPassport;
    private String drivingLicenseNo;
    private LocalDateTime createdAt;

    public static CustomerResponse fromEntity(Customer customer) {
        return CustomerResponse.builder()
                .customerId(customer.getCustomerId())
                .fullName(customer.getFullName())
                .phone(customer.getPhone())
                .email(customer.getEmail())
                .nicOrPassport(customer.getNicOrPassport())
                .drivingLicenseNo(customer.getDrivingLicenseNo())
                .createdAt(customer.getCreatedAt())
                .build();
    }
}
