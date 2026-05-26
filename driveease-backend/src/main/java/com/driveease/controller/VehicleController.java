package com.driveease.controller;

import com.driveease.dto.VehicleRequest;
import com.driveease.dto.VehicleResponse;
import com.driveease.dto.VehicleSearchRequest;
import com.driveease.dto.VehicleSearchResponse;
import com.driveease.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "http://localhost:5173")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @PostMapping
    public VehicleResponse createVehicle(@Valid @RequestBody VehicleRequest request) {
        return vehicleService.createVehicle(request);
    }

    @GetMapping
    public List<VehicleResponse> getAllVehicles() {
        return vehicleService.getAllVehicles();
    }

    @GetMapping("/{id}")
    public VehicleResponse getVehicleById(@PathVariable Long id) {
        return vehicleService.getVehicleById(id);
    }

    @PutMapping("/{id}")
    public VehicleResponse updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleRequest request) {
        return vehicleService.updateVehicle(id, request);
    }

    @DeleteMapping("/{id}")
    public String deactivateVehicle(@PathVariable Long id) {
        vehicleService.deactivateVehicle(id);
        return "Vehicle deactivated successfully";
    }

    @PostMapping("/search")
    public List<VehicleSearchResponse> searchVehicles(
            @Valid @RequestBody VehicleSearchRequest request) {
        return vehicleService.searchVehicles(request);
    }
}
