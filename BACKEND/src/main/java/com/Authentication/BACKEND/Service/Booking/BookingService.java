package com.Authentication.BACKEND.Service.Booking;

import com.Authentication.BACKEND.Io.Booking.AvailableSlotResponse;
import com.Authentication.BACKEND.Io.Booking.BookedIntervalResponse;
import com.Authentication.BACKEND.Io.Booking.BookingRequest;
import com.Authentication.BACKEND.Io.Booking.BookingResponse;

import java.util.List;
//booking service interface
public interface BookingService {

    BookingResponse createBooking(String email, BookingRequest request);

    List<BookingResponse> getMyBookings(String email);

    List<BookingResponse> getAllBookings();

    BookingResponse updateStatus(Long id, String status, String reason);

    void cancelBooking(Long id, String email);
    List<AvailableSlotResponse> getAvailableSlots(Long facilityId, String date);
    List<BookingResponse> getBookingsByFacilityAndDate(Long facilityId, String date);
    List<BookedIntervalResponse> getBookedIntervals(Long facilityId, String date);
}