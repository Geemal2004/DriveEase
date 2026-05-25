package com.driveease.service;

import com.driveease.dto.BookingRequest;
import com.driveease.dto.BookingResponse;
import com.driveease.enums.BookingStatus;
import com.driveease.model.*;
import com.driveease.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class BookingService {

    private static final BigDecimal MARKUP_PERCENTAGE = BigDecimal.valueOf(10.00);
    private static final BigDecimal MARKUP_MULTIPLIER = BigDecimal.valueOf(1.10);

    private final BookingRepository bookingRepository;
    private final BookingVehicleRepository bookingVehicleRepository;
    private final CustomerRepository customerRepository;
    private final AppUserRepository appUserRepository;
    private final VehicleRepository vehicleRepository;

    public BookingService(
            BookingRepository bookingRepository,
            BookingVehicleRepository bookingVehicleRepository,
            CustomerRepository customerRepository,
            AppUserRepository appUserRepository,
            VehicleRepository vehicleRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.bookingVehicleRepository = bookingVehicleRepository;
        this.customerRepository = customerRepository;
        this.appUserRepository = appUserRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + request.getCustomerId()));

        AppUser createdBy = appUserRepository.findById(request.getCreatedByUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getCreatedByUserId()));

        List<Vehicle> vehicles = vehicleRepository.findAllById(request.getVehicleIds());

        if (vehicles.size() != request.getVehicleIds().size()) {
            throw new RuntimeException("One or more selected vehicles were not found");
        }

        LocalDate returnDate = request.getPickupDate().plusDays(request.getRentalDays());

        BigDecimal totalAmount = BigDecimal.ZERO;

        Booking booking = Booking.builder()
                .customer(customer)
                .createdBy(createdBy)
                .pickupDate(request.getPickupDate())
                .returnDate(returnDate)
                .rentalDays(request.getRentalDays())
                .markupPercentage(MARKUP_PERCENTAGE)
                .totalAmount(BigDecimal.ZERO)
                .status(request.getStatus() != null ? request.getStatus() : BookingStatus.CONFIRMED)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        for (Vehicle vehicle : vehicles) {
            BigDecimal finalDailyRate = vehicle.getBaseDailyRate()
                    .multiply(MARKUP_MULTIPLIER)
                    .setScale(2, RoundingMode.HALF_UP);

            BigDecimal lineTotal = finalDailyRate
                    .multiply(BigDecimal.valueOf(request.getRentalDays()))
                    .setScale(2, RoundingMode.HALF_UP);

            BookingVehicle bookingVehicle = BookingVehicle.builder()
                    .booking(savedBooking)
                    .vehicle(vehicle)
                    .baseDailyRate(vehicle.getBaseDailyRate())
                    .finalDailyRate(finalDailyRate)
                    .lineTotal(lineTotal)
                    .build();

            bookingVehicleRepository.save(bookingVehicle);
            totalAmount = totalAmount.add(lineTotal);
        }

        savedBooking.setTotalAmount(totalAmount);
        Booking finalBooking = bookingRepository.save(savedBooking);

        List<BookingVehicle> bookingVehicles =
                bookingVehicleRepository.findByBookingBookingId(finalBooking.getBookingId());

        return BookingResponse.fromEntity(finalBooking, bookingVehicles);
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(booking -> {
                    List<BookingVehicle> bookingVehicles =
                            bookingVehicleRepository.findByBookingBookingId(booking.getBookingId());

                    return BookingResponse.fromEntity(booking, bookingVehicles);
                })
                .toList();
    }

    public BookingResponse getBookingById(Long id) {
        Booking booking = getBookingEntityById(id);

        List<BookingVehicle> bookingVehicles =
                bookingVehicleRepository.findByBookingBookingId(id);

        return BookingResponse.fromEntity(booking, bookingVehicles);
    }

    public BookingResponse cancelBooking(Long id) {
        Booking booking = getBookingEntityById(id);
        booking.setStatus(BookingStatus.CANCELLED);

        Booking updatedBooking = bookingRepository.save(booking);

        List<BookingVehicle> bookingVehicles =
                bookingVehicleRepository.findByBookingBookingId(id);

        return BookingResponse.fromEntity(updatedBooking, bookingVehicles);
    }

    public BookingResponse completeBooking(Long id) {
        Booking booking = getBookingEntityById(id);
        booking.setStatus(BookingStatus.COMPLETED);

        Booking updatedBooking = bookingRepository.save(booking);

        List<BookingVehicle> bookingVehicles =
                bookingVehicleRepository.findByBookingBookingId(id);

        return BookingResponse.fromEntity(updatedBooking, bookingVehicles);
    }

    private Booking getBookingEntityById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
    }
}
