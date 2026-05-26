package com.driveease.controller;

import com.driveease.dto.ContractRequest;
import com.driveease.dto.ContractResponse;
import com.driveease.service.ContractService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
@CrossOrigin(origins = "http://localhost:5173")
public class ContractController {

    private final ContractService contractService;

    public ContractController(ContractService contractService) {
        this.contractService = contractService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ContractResponse createContract(@Valid @RequestBody ContractRequest request) {
        return contractService.createContract(request);
    }

    @GetMapping
    public List<ContractResponse> getAllContracts() {
        return contractService.getAllContracts();
    }

    @GetMapping("/{id}")
    public ContractResponse getContractById(@PathVariable Long id) {
        return contractService.getContractById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ContractResponse updateContract(
            @PathVariable Long id,
            @Valid @RequestBody ContractRequest request) {
        return contractService.updateContract(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public String removeContract(@PathVariable Long id) {
        contractService.removeContract(id);
        return "Contract removed successfully";
    }
}
