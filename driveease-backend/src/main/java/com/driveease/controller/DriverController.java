package com.driveease.controller;

import com.driveease.dto.DriverRequest;
import com.driveease.dto.DriverResponse;
import com.driveease.service.DriverService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    private final DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    @PostMapping
    public DriverResponse createDriver(@Valid @RequestBody DriverRequest request) {
        return driverService.createDriver(request);
    }

    @GetMapping
    public List<DriverResponse> getAllDrivers() {
        return driverService.getAllDrivers();
    }

    @GetMapping("/{id}")
    public DriverResponse getDriverById(@PathVariable Long id) {
        return driverService.getDriverById(id);
    }

    @PutMapping("/{id}")
    public DriverResponse updateDriver(
            @PathVariable Long id,
            @Valid @RequestBody DriverRequest request
    ) {
        return driverService.updateDriver(id, request);
    }

    @DeleteMapping("/{id}")
    public String deactivateDriver(@PathVariable Long id) {
        driverService.deactivateDriver(id);
        return "Driver deactivated successfully";
    }
}
