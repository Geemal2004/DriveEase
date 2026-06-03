package com.driveease.service;

import com.driveease.dto.BookingRequest;
import com.driveease.dto.BookingResponse;
import com.driveease.dto.BookingVehicleRequest;
import com.driveease.dto.VehicleMileageUpdate;
import com.driveease.repository.BookingVehicleRepository;
import com.driveease.dto.CompleteBookingRequest;
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
    private static final BigDecimal MARKUP_MULTIPLIER = BigDecimal.ONE.add(MARKUP_PERCENTAGE.divide(BigDecimal.valueOf(100)));

    private final BookingRepository bookingRepository;
    private final BookingVehicleRepository bookingVehicleRepository;
    private final CustomerRepository customerRepository;
    private final AppUserRepository appUserRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;

    public BookingService(
            BookingRepository bookingRepository,
            BookingVehicleRepository bookingVehicleRepository,
            CustomerRepository customerRepository,
            AppUserRepository appUserRepository,
            VehicleRepository vehicleRepository,
            DriverRepository driverRepository) {
        this.bookingRepository = bookingRepository;
        this.bookingVehicleRepository = bookingVehicleRepository;
        this.customerRepository = customerRepository;
        this.appUserRepository = appUserRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + request.getCustomerId()));

        AppUser createdBy = appUserRepository.findById(request.getCreatedByUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getCreatedByUserId()));
        
        LocalDate returnDate = request.getPickupDate().plusDays(request.getRentalDays());

        BookingStatus bookingStatus = request.getStatus() != null
            ? request.getStatus()
            : BookingStatus.CONFIRMED;
        
        if (bookingStatus == BookingStatus.CONFIRMED) {
            ValidateVehicleAvailability(request.getVehicles(), request.getPickupDate(), returnDate);

        }

        
        Booking booking = Booking.builder()
                .customer(customer)
                .createdBy(createdBy)
                .pickupDate(request.getPickupDate())
                .returnDate(returnDate)
                .rentalDays(request.getRentalDays())
                .markupPercentage(MARKUP_PERCENTAGE)
                .totalAmount(BigDecimal.ZERO)
                .status(bookingStatus)
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (BookingVehicleRequest vehicleRequest : request.getVehicles()) {
            Vehicle vehicle = vehicleRepository.findById(vehicleRequest.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found with  ID:" + vehicleRequest.getVehicleId()));

            Driver driver = null;

            if (vehicleRequest.getDriverId() != null) {
                driver = driverRepository.findById(vehicleRequest.getDriverId())
                      .orElseThrow(() -> new RuntimeException("Driver not Found with ID:" + vehicleRequest.getDriverId()));

            }

            BigDecimal baseDailyRate = vehicle.getBaseDailyRate();

            BigDecimal finalDailyRate = baseDailyRate.multiply(MARKUP_MULTIPLIER).setScale(2, RoundingMode.HALF_UP);

            BigDecimal lineTotal = finalDailyRate.multiply(BigDecimal.valueOf(request.getRentalDays())).setScale(2,RoundingMode.HALF_UP);

            BookingVehicle bookingVehicle = BookingVehicle.builder()
                 .booking(savedBooking)
                 .vehicle(vehicle)
                 .driver(driver)
                 .startMileage(vehicleRequest.getStartMileage())
                 .baseDailyRate(baseDailyRate)
                 .finalDailyRate(finalDailyRate)
                 .lineTotal(lineTotal)
                 .build();

            bookingVehicleRepository.save(bookingVehicle);

            totalAmount = totalAmount.add(lineTotal);
        }

        savedBooking.setTotalAmount(totalAmount);
        Booking finalBooking = bookingRepository.save(savedBooking);

        List<BookingVehicle> bookingVehicles = bookingVehicleRepository.findByBookingBookingId(finalBooking.getBookingId());

        return BookingResponse.fromEntity(finalBooking, bookingVehicles);
    }

    

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(booking -> {
                    List<BookingVehicle> bookingVehicles = bookingVehicleRepository
                            .findByBookingBookingId(booking.getBookingId());

                    return BookingResponse.fromEntity(booking, bookingVehicles);
                })
                .toList();
    }

    public BookingResponse getBookingById(Long id) {
        Booking booking = getBookingEntityById(id);

        List<BookingVehicle> bookingVehicles = bookingVehicleRepository.findByBookingBookingId(id);

        return BookingResponse.fromEntity(booking, bookingVehicles);
    }

    public BookingResponse cancelBooking(Long id) {
        Booking booking = getBookingEntityById(id);
        booking.setStatus(BookingStatus.CANCELLED);

        Booking updatedBooking = bookingRepository.save(booking);

        List<BookingVehicle> bookingVehicles = bookingVehicleRepository.findByBookingBookingId(id);

        return BookingResponse.fromEntity(updatedBooking, bookingVehicles);
    }



    @Transactional
    public BookingResponse completeBooking(Long id, CompleteBookingRequest request) {
        Booking booking = getBookingEntityById(id);
        booking.setStatus(BookingStatus.COMPLETED);

        Booking updatedBooking = bookingRepository.save(booking);

        
        List<BookingVehicle> bookingVehicles = bookingVehicleRepository.findByBookingBookingId(id);



        for (BookingVehicle bookingVehicle : bookingVehicles) {
            for(VehicleMileageUpdate mileageUpdate : request.getReturnedVehicles()) {
                if(bookingVehicle.getVehicle().getVehicleId().equals(mileageUpdate.getVehicleId())) {
                    bookingVehicle.setEndMileage(mileageUpdate.getEndMileage());
                break;
                }
            
            }
           
        }
        bookingVehicleRepository.saveAll(bookingVehicles);

        return BookingResponse.fromEntity(updatedBooking, bookingVehicles);
    }

    private void ValidateVehicleAvailability(
        List<BookingVehicleRequest> vehicleRequests,
        LocalDate pickupDate,
        LocalDate returnDate
    )
    {
        for (BookingVehicleRequest vehicleRequest : vehicleRequests) {
            boolean alreadyBooked = bookingVehicleRepository.existsVehicleBookingOverlap(
                    vehicleRequest.getVehicleId(),
                    pickupDate,
                    returnDate,
                    List.of(BookingStatus.CONFIRMED)
            );
            if (alreadyBooked) {
                throw new RuntimeException(
                    "Vehicle with id " + vehicleRequest.getVehicleId() + "is already booked for the selected date range"

                );
            }
        }
    }

    private Booking getBookingEntityById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
    }
}
