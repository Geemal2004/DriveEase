package com.driveease.service;

import com.driveease.dto.ContractRequest;
import com.driveease.dto.ContractResponse;
import com.driveease.enums.ContractStatus;
import com.driveease.model.AppUser;
import com.driveease.model.Contract;
import com.driveease.model.Provider;
import com.driveease.repository.AppUserRepository;
import com.driveease.repository.ContractRepository;
import com.driveease.repository.ProviderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContractService {

    private final ContractRepository contractRepository;
    private final ProviderRepository providerRepository;
    private final AppUserRepository appUserRepository;

    public ContractService(
            ContractRepository contractRepository,
            ProviderRepository providerRepository,
            AppUserRepository appUserRepository
    ) {
        this.contractRepository = contractRepository;
        this.providerRepository = providerRepository;
        this.appUserRepository = appUserRepository;
    }

    public ContractResponse createContract(ContractRequest request) {
        Provider provider = providerRepository.findById(request.getProviderId())
                .orElseThrow(() -> new RuntimeException("Provider not found with id: " + request.getProviderId()));

        AppUser uploadedBy = appUserRepository.findById(request.getUploadedByUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUploadedByUserId()));

        Contract contract = Contract.builder()
                .provider(provider)
                .uploadedBy(uploadedBy)
                .documentName(request.getDocumentName())
                .documentUrl(request.getDocumentUrl())
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveTo(request.getEffectiveTo())
                .status(request.getStatus() != null ? request.getStatus() : ContractStatus.ACTIVE)
                .build();

        Contract savedContract = contractRepository.save(contract);
        return ContractResponse.fromEntity(savedContract);
    }

    public List<ContractResponse> getAllContracts() {
        return contractRepository.findAll()
                .stream()
                .map(ContractResponse::fromEntity)
                .toList();
    }

    public ContractResponse getContractById(Long id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found with id: " + id));

        return ContractResponse.fromEntity(contract);
    }

    public ContractResponse updateContract(Long id, ContractRequest request) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found with id: " + id));

        Provider provider = providerRepository.findById(request.getProviderId())
                .orElseThrow(() -> new RuntimeException("Provider not found with id: " + request.getProviderId()));

        AppUser uploadedBy = appUserRepository.findById(request.getUploadedByUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUploadedByUserId()));

        contract.setProvider(provider);
        contract.setUploadedBy(uploadedBy);
        contract.setDocumentName(request.getDocumentName());
        contract.setDocumentUrl(request.getDocumentUrl());
        contract.setEffectiveFrom(request.getEffectiveFrom());
        contract.setEffectiveTo(request.getEffectiveTo());

        if (request.getStatus() != null) {
            contract.setStatus(request.getStatus());
        }

        Contract updatedContract = contractRepository.save(contract);
        return ContractResponse.fromEntity(updatedContract);
    }

    public void removeContract(Long id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found with id: " + id));

        contract.setStatus(ContractStatus.REMOVED);
        contractRepository.save(contract);
    }
}
