package com.driveease.repository;

import com.driveease.model.BookingVehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingVehicleRepository extends JpaRepository<BookingVehicle, Long> {

    List<BookingVehicle> findByBookingBookingId(Long bookingId);
}
