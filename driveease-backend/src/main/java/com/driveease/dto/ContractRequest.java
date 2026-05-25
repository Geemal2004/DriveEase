package com.driveease.dto;

import com.driveease.enums.ContractStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ContractRequest {

    @NotNull(message = "Provider ID is required")
    private Long providerId;

    @NotNull(message = "Uploaded by user ID is required")
    private Long uploadedByUserId;

    @NotBlank(message = "Document name is required")
    private String documentName;

    private String documentUrl;

    @NotNull(message = "Effective from date is required")
    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;

    private ContractStatus status;
}
