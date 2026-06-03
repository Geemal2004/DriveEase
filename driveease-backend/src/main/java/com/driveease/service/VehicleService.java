package com.driveease.service;

import com.driveease.dto.VehicleRequest;
import com.driveease.dto.VehicleResponse;
import com.driveease.dto.VehicleSearchRequest;
import com.driveease.dto.VehicleSearchResponse;
import com.driveease.enums.AvailabilityStatus;
import com.driveease.enums.BookingStatus;
import com.driveease.enums.ContractStatus;
import com.driveease.model.Contract;
import com.driveease.model.Vehicle;
import com.driveease.repository.ContractRepository;
import com.driveease.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class VehicleService {

    private static final BigDecimal MARKUP_MULTIPLIER = BigDecimal.valueOf(1.10);

    private final VehicleRepository vehicleRepository;
    private final ContractRepository contractRepository;

    public VehicleService(
            VehicleRepository vehicleRepository,
            ContractRepository contractRepository) {
        this.vehicleRepository = vehicleRepository;
        this.contractRepository = contractRepository;
    }

    public VehicleResponse createVehicle(VehicleRequest request) {
        Contract contract = contractRepository.findById(request.getContractId())
                .orElseThrow(() -> new RuntimeException("Contract not found with id: " + request.getContractId()));

        Vehicle vehicle = Vehicle.builder()
                .contract(contract)
                .vehicleType(request.getVehicleType())
                .registrationNo(request.getRegistrationNo())
                .model(request.getModel())
                .imageUrl(request.getImageUrl())
                .baseDailyRate(request.getBaseDailyRate())
                .allowedMileagePerDay(request.getAllowedMileagePerDay())
                .extraMileageRate(request.getExtraMileageRate() != null
                     ? request.getExtraMileageRate()
                     : BigDecimal.ZERO)
                .availabilityStatus(request.getAvailabilityStatus() != null
                        ? request.getAvailabilityStatus()
                        : AvailabilityStatus.AVAILABLE)
                .serviceMileageInterval(request.getServiceMileageInterval())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return VehicleResponse.fromEntity(savedVehicle);
    }

    public List<VehicleResponse> getAllVehicles() {
        return vehicleRepository.findAll()
                .stream()
                .map(VehicleResponse::fromEntity)
                .toList();
    }

    public VehicleResponse getVehicleById(Long id) {
        Vehicle vehicle = getVehicleEntityById(id);
        return VehicleResponse.fromEntity(vehicle);
    }

    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {
        Vehicle vehicle = getVehicleEntityById(id);

        Contract contract = contractRepository.findById(request.getContractId())
                .orElseThrow(() -> new RuntimeException("Contract not found with id: " + request.getContractId()));

        vehicle.setContract(contract);
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setRegistrationNo(request.getRegistrationNo());
        vehicle.setModel(request.getModel());
        vehicle.setImageUrl(request.getImageUrl());
        vehicle.setBaseDailyRate(request.getBaseDailyRate());
        vehicle.setExtraMileageRate(request.getExtraMileageRate() != null
                     ? request.getExtraMileageRate()
                     : BigDecimal.ZERO);
                
        vehicle.setServiceMileageInterval(request.getServiceMileageInterval());
        vehicle.setAllowedMileagePerDay(request.getAllowedMileagePerDay());

        if (request.getAvailabilityStatus() != null) {
            vehicle.setAvailabilityStatus(request.getAvailabilityStatus());
        }

        if (request.getActive() != null) {
            vehicle.setActive(request.getActive());
        }

        Vehicle updatedVehicle = vehicleRepository.save(vehicle);
        return VehicleResponse.fromEntity(updatedVehicle);
    }

    public void deactivateVehicle(Long id) {
        Vehicle vehicle = getVehicleEntityById(id);
        vehicle.setActive(false);
        vehicle.setAvailabilityStatus(AvailabilityStatus.NOT_AVAILABLE);
        vehicleRepository.save(vehicle);
    }

    public List<VehicleSearchResponse> searchVehicles(VehicleSearchRequest request) {
        LocalDate returnDate = request.getPickupDate().plusDays(request.getRentalDays());

        List<Vehicle> vehicles = vehicleRepository.searchAvailableVehicles(
                request.getVehicleType(),
                AvailabilityStatus.AVAILABLE,
                ContractStatus.ACTIVE,
                request.getPickupDate(),
                returnDate,
                List.of(BookingStatus.CONFIRMED));

        return vehicles.stream()
                .map(vehicle -> mapToSearchResponse(vehicle, request))
                .toList();
    }

    private VehicleSearchResponse mapToSearchResponse(
            Vehicle vehicle,
            VehicleSearchRequest request) {
        BigDecimal finalDailyRate = vehicle.getBaseDailyRate()
                .multiply(MARKUP_MULTIPLIER)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalPrice = finalDailyRate
                .multiply(BigDecimal.valueOf(request.getRentalDays()))
                .setScale(2, RoundingMode.HALF_UP);

        return VehicleSearchResponse.builder()
                .vehicleId(vehicle.getVehicleId())
                .providerName(vehicle.getContract().getProvider().getProviderName())
                .vehicleType(vehicle.getVehicleType())
                .registrationNo(vehicle.getRegistrationNo())
                .model(vehicle.getModel())
                .imageUrl(vehicle.getImageUrl())
                .baseDailyRate(vehicle.getBaseDailyRate())
                .extraMileageRate(vehicle.getExtraMileageRate())
                .finalDailyRate(finalDailyRate)
                .rentalDays(request.getRentalDays())
                .numberOfVehicles(1)
                .totalPrice(totalPrice)
                .allowedMileagePerDay(vehicle.getAllowedMileagePerDay())
                .extraMileageRate(vehicle.getExtraMileageRate())
                .serviceMileageInterval(vehicle.getServiceMileageInterval())
                .availabilityStatus(vehicle.getAvailabilityStatus())
                .build();
    }

    private Vehicle getVehicleEntityById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + id));
    }


}
