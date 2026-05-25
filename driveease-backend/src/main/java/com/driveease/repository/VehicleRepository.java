package com.driveease.repository;

import com.driveease.enums.AvailabilityStatus;
import com.driveease.enums.ContractStatus;
import com.driveease.enums.VehicleType;
import com.driveease.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    @Query("""
        SELECT v FROM Vehicle v
        JOIN v.contract c
        WHERE v.vehicleType = :vehicleType
          AND v.availabilityStatus = :availabilityStatus
          AND v.active = true
          AND c.status = :contractStatus
          AND c.effectiveFrom <= :pickupDate
          AND (c.effectiveTo IS NULL OR c.effectiveTo >= :returnDate)
    """)
    List<Vehicle> searchAvailableVehicles(
            VehicleType vehicleType,
            AvailabilityStatus availabilityStatus,
            ContractStatus contractStatus,
            LocalDate pickupDate,
            LocalDate returnDate
    );
}
