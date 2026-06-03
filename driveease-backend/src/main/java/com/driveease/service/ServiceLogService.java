package com.driveease.service;

import com.driveease.model.ServiceLog;
import com.driveease.repository.ServiceLogRepository;
import com.driveease.repository.VehicleRepository;
import com.driveease.model.Vehicle;
import com.driveease.dto.ServiceLogResponse;
import com.driveease.dto.ServiceLogRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceLogService {

    private final ServiceLogRepository serviceLogRepository;
    private final VehicleRepository vehicleRepository;

    public ServiceLogService(
        ServiceLogRepository serviceLogRepository, 
        VehicleRepository vehicleRepository
    ) {
        this.serviceLogRepository = serviceLogRepository;
        this.vehicleRepository = vehicleRepository;
    }

    public ServiceLogResponse createServiceLog(ServiceLogRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + request.getVehicleId()));
        ServiceLog serviceLog = ServiceLog.builder()
                .vehicle(vehicle)
                .serviceLocation(request.getServiceLocation())
                .serviceDate(request.getServiceDate())
                .notes(request.getNotes())
                .cost(request.getCost())
                .build();
        
        ServiceLog savedLog = serviceLogRepository.save(serviceLog);
        return ServiceLogResponse.fromEntity(savedLog);
    }

    public List<ServiceLogResponse> getAllServiceLogs() {
        return serviceLogRepository.findAll()
                .stream()
                .map(ServiceLogResponse::fromEntity)
                .toList();
    }

    public ServiceLogResponse getServiceLogById(Long logId) {
        ServiceLog serviceLog = serviceLogRepository.findById(logId)
                .orElseThrow(() -> new RuntimeException("Service log not found with id: " + logId));
        return ServiceLogResponse.fromEntity(serviceLog);
    }   


    public List<ServiceLogResponse> getServiceLogsByVehicleId(Long vehicleId) {
        return serviceLogRepository.findByVehicleVehicleId(vehicleId)
                .stream()
                .map(ServiceLogResponse::fromEntity)
                .toList();
    }

    public ServiceLogResponse updateServiceLog(Long logId, ServiceLogRequest request) {
        ServiceLog serviceLog = serviceLogRepository.findById(logId)
                .orElseThrow(() -> new RuntimeException("Service log not found with id: " + logId));
        
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + request.getVehicleId()));
        
        serviceLog.setVehicle(vehicle);
        serviceLog.setServiceLocation(request.getServiceLocation());
        serviceLog.setServiceDate(request.getServiceDate());
        serviceLog.setNotes(request.getNotes());
        serviceLog.setCost(request.getCost());
        ServiceLog updatedLog = serviceLogRepository.save(serviceLog);
        return ServiceLogResponse.fromEntity(updatedLog);
    }

    public void getServiceLogEntityById(Long logId) {
        serviceLogRepository.findById(logId)
                .orElseThrow(() -> new RuntimeException("Service log not found with id: " + logId));
    }
    

}