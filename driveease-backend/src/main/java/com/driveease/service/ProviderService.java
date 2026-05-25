package com.driveease.service;

import com.driveease.dto.ProviderRequest;
import com.driveease.enums.AccountStatus;
import com.driveease.model.Provider;
import com.driveease.repository.ProviderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProviderService {

    private final ProviderRepository providerRepository;

    public ProviderService(ProviderRepository providerRepository) {
        this.providerRepository = providerRepository;
    }

    public Provider createProvider(ProviderRequest request) {
        Provider provider = Provider.builder()
                .providerName(request.getProviderName())
                .contactPerson(request.getContactPerson())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .status(request.getStatus() != null ? request.getStatus() : AccountStatus.ACTIVE)
                .build();

        return providerRepository.save(provider);
    }

    public List<Provider> getAllProviders() {
        return providerRepository.findAll();
    }

    public Provider getProviderById(Long id) {
        return providerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Provider not found with id: " + id));
    }

    public Provider updateProvider(Long id, ProviderRequest request) {
        Provider provider = getProviderById(id);

        provider.setProviderName(request.getProviderName());
        provider.setContactPerson(request.getContactPerson());
        provider.setPhone(request.getPhone());
        provider.setEmail(request.getEmail());
        provider.setAddress(request.getAddress());

        if (request.getStatus() != null) {
            provider.setStatus(request.getStatus());
        }

        return providerRepository.save(provider);
    }

    public void deactivateProvider(Long id) {
        Provider provider = getProviderById(id);
        provider.setStatus(AccountStatus.INACTIVE);
        providerRepository.save(provider);
    }
}