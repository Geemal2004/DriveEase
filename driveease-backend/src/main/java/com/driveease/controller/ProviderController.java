package com.driveease.controller;

import com.driveease.dto.ProviderRequest;
import com.driveease.model.Provider;
import com.driveease.service.ProviderService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/providers")
@CrossOrigin(origins = "http://localhost:5173")
public class ProviderController {

    private final ProviderService providerService;

    public ProviderController(ProviderService providerService) {
        this.providerService = providerService;
    }

    @PostMapping
    public Provider createProvider(@Valid @RequestBody ProviderRequest request) {
        return providerService.createProvider(request);
    }

    @GetMapping
    public List<Provider> getAllProviders() {
        return providerService.getAllProviders();
    }

    @GetMapping("/{id}")
    public Provider getProviderById(@PathVariable Long id) {
        return providerService.getProviderById(id);
    }

    @PutMapping("/{id}")
    public Provider updateProvider(
            @PathVariable Long id,
            @Valid @RequestBody ProviderRequest request
    ) {
        return providerService.updateProvider(id, request);
    }

    @DeleteMapping("/{id}")
    public String deactivateProvider(@PathVariable Long id) {
        providerService.deactivateProvider(id);
        return "Provider deactivated successfully";
    }
}