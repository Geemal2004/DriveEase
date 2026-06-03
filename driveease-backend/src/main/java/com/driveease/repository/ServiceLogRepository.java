package com.driveease.repository;

import com.driveease.model.ServiceLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceLogRepository extends JpaRepository<ServiceLog, Long> {
    List<ServiceLog> findByVehicleVehicleId(Long vehicleId);
}