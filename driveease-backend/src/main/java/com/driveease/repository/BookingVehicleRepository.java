package com.driveease.repository;

import com.driveease.enums.BookingStatus;
import com.driveease.model.BookingVehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface BookingVehicleRepository extends JpaRepository<BookingVehicle, Long> {

    List<BookingVehicle> findByBookingBookingId(Long bookingId);

    @Query("""
        SELECT COUNT(bv) > 0 FROM BookingVehicle bv
        JOIN bv.booking b
        WHERE bv.vehicle.vehicleId = :vehicleId
          AND b.status IN :bookedStatuses
          AND b.pickupDate < :returnDate
          AND b.returnDate > :pickupDate
    """)
    boolean existsVehicleBookingOverlap(
            Long vehicleId,
            LocalDate pickupDate,
            LocalDate returnDate,
            List<BookingStatus> bookedStatuses
    );
}