package com.driveease.dto;

import com.driveease.enums.ContractStatus;
import com.driveease.model.Contract;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class ContractResponse {

    private Long contractId;
    private Long providerId;
    private String providerName;
    private Long uploadedByUserId;
    private String uploadedByUserName;
    private String documentName;
    private String documentUrl;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private ContractStatus status;
    private LocalDateTime uploadedAt;

    public static ContractResponse fromEntity(Contract contract) {
        return ContractResponse.builder()
                .contractId(contract.getContractId())
                .providerId(contract.getProvider().getProviderId())
                .providerName(contract.getProvider().getProviderName())
                .uploadedByUserId(contract.getUploadedBy().getUserId())
                .uploadedByUserName(contract.getUploadedBy().getFullName())
                .documentName(contract.getDocumentName())
                .documentUrl(contract.getDocumentUrl())
                .effectiveFrom(contract.getEffectiveFrom())
                .effectiveTo(contract.getEffectiveTo())
                .status(contract.getStatus())
                .uploadedAt(contract.getUploadedAt())
                .build();
    }
}
