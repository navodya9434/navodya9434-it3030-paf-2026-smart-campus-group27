package com.Authentication.BACKEND.Controller.Booking;

import com.Authentication.BACKEND.Io.Booking.AvailableSlotResponse;
import com.Authentication.BACKEND.Io.Booking.BookedIntervalResponse;
import com.Authentication.BACKEND.Io.Booking.BookingRequest;
import com.Authentication.BACKEND.Io.Booking.BookingResponse;
import com.Authentication.BACKEND.Service.Booking.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.Authentication.BACKEND.Service.Booking.BookingQrService;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;


import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final BookingQrService bookingQrService;

    @PostMapping
    public BookingResponse create(
            @RequestBody BookingRequest request,
            @CurrentSecurityContext(expression = "authentication?.name") String email
    ) {
        return bookingService.createBooking(email, request);
    }

    @GetMapping("/my")
    public List<BookingResponse> myBookings(
            @CurrentSecurityContext(expression = "authentication?.name") String email
    ) {
        return bookingService.getMyBookings(email);
    }

    @GetMapping("/all")
    public List<BookingResponse> all() {
        return bookingService.getAllBookings();
    }

    @PutMapping("/{id}/status")
    public BookingResponse updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String reason
    ) {
        return bookingService.updateStatus(id, status, reason);
    }

    @DeleteMapping("/{id}")
    public void cancel(
            @PathVariable Long id,
            @CurrentSecurityContext(expression = "authentication?.name") String email
    ) {
        bookingService.cancelBooking(id, email);
    }
    @GetMapping("/available-slots")
public List<AvailableSlotResponse> getSlots(
        @RequestParam Long facilityId,
        @RequestParam String date
) {
    return bookingService.getAvailableSlots(facilityId, date);
}

@GetMapping("/facility/{facilityId}/day")
public List<BookingResponse> getBookingsByFacilityAndDay(
        @PathVariable Long facilityId,
        @RequestParam String date
) {
    return bookingService.getBookingsByFacilityAndDate(facilityId, date);
}
@GetMapping("/facility/{facilityId}/booked-intervals")
public List<BookedIntervalResponse> getBookedIntervals(
        @PathVariable Long facilityId,
        @RequestParam String date
) {
    return bookingService.getBookedIntervals(facilityId, date);
}

@GetMapping(value = "/{id}/qr", produces = MediaType.IMAGE_PNG_VALUE)
public ResponseEntity<byte[]> getQr(@PathVariable Long id) {

    byte[] qr = bookingQrService.generateBookingQr(id);

    return ResponseEntity.ok()
            .contentType(MediaType.IMAGE_PNG)
            .body(qr);
}
}