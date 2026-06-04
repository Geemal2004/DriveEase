package com.driveease.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class BulkCompleteBookingRequest {

    @NotEmpty
    @Valid
    private List<BulkCompleteBookingItem> bookings;

    public List<BulkCompleteBookingItem> getBookings() {
        return bookings;
    }

    public void setBookings(List<BulkCompleteBookingItem> bookings) {
        this.bookings = bookings;
    }
}
