package com.driveease.controller;

import com.driveease.dto.ServiceLogRequest;
import com.driveease.dto.ServiceLogResponse;
import com.driveease.service.ServiceLogService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/api/service-logs")
public class ServiceLogController {
    private final ServiceLogService serviceLogService;

    public ServiceLogController(ServiceLogService serviceLogService) {
        this.serviceLogService = serviceLogService;
    }

    @PostMapping
    public ServiceLogResponse createServiceLog(@Valid @RequestBody ServiceLogRequest request) {
        return serviceLogService.createServiceLog(request);
    }

    @GetMapping
    public List<ServiceLogResponse> getAllServiceLogs() {
        return serviceLogService.getAllServiceLogs();
    }

    @GetMapping("/{id}")
    public ServiceLogResponse getServiceLogById(@PathVariable Long id) {
        return serviceLogService.getServiceLogById(id);
    }
    
    @GetMapping("/vehicle/{vehicleId}")
    public List<ServiceLogResponse> getServiceLogsByVehicleId(@PathVariable Long vehicleId) {
        return serviceLogService.getServiceLogsByVehicleId(vehicleId);
    }

    @PutMapping("/{id}")
    public ServiceLogResponse updateServiceLog(
        @PathVariable Long id,
        @Valid @RequestBody ServiceLogRequest request) {
            return serviceLogService.updateServiceLog(id, request);
    }
    
}
