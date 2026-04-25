package com.Authentication.BACKEND.Io.Booking;

import com.Authentication.BACKEND.Entity.Booking.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class BookingResponse {

    private Long id;
    private Long facilityId;
    private String facilityName;

    private String userEmail;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private String purpose;
    private Integer expectedAttendees;

    private BookingStatus status;
    private String adminReason;
}