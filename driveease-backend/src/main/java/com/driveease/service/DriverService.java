package com.driveease.service;

import com.driveease.dto.DriverRequest;
import com.driveease.dto.DriverResponse;
import com.driveease.enums.DriverStatus;
import com.driveease.model.Driver;
import com.driveease.repository.DriverRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DriverService {

    private final DriverRepository driverRepository;

    public DriverService(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    public DriverResponse createDriver(DriverRequest request) {
        Driver driver = Driver.builder()
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .nicOrPassport(request.getNicOrPassport())
                .drivingLicenseNo(request.getDrivingLicenseNo())
                .status(request.getStatus() != null ? request.getStatus() : DriverStatus.ACTIVE)
                .build();

        Driver savedDriver = driverRepository.save(driver);
        return DriverResponse.fromEntity(savedDriver);
    }

    public List<DriverResponse> getAllDrivers() {
        return driverRepository.findAll()
                .stream()
                .map(DriverResponse::fromEntity)
                .toList();
    }

    public DriverResponse getDriverById(Long id) {
        Driver driver = getDriverEntityById(id);
        return DriverResponse.fromEntity(driver);
    }

    public DriverResponse updateDriver(Long id, DriverRequest request) {
        Driver driver = getDriverEntityById(id);

        driver.setFullName(request.getFullName());
        driver.setPhone(request.getPhone());
        driver.setNicOrPassport(request.getNicOrPassport());
        driver.setDrivingLicenseNo(request.getDrivingLicenseNo());

        if (request.getStatus() != null) {
            driver.setStatus(request.getStatus());
        }

        Driver updatedDriver = driverRepository.save(driver);
        return DriverResponse.fromEntity(updatedDriver);
    }

    public void deactivateDriver(Long id) {
        Driver driver = getDriverEntityById(id);
        driver.setStatus(DriverStatus.INACTIVE);
        driverRepository.save(driver);
    }

    private Driver getDriverEntityById(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found with id: " + id));
    }
}