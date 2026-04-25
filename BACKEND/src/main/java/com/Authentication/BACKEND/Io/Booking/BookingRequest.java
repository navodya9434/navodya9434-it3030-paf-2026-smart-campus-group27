package com.Authentication.BACKEND.Io.Booking;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookingRequest {
    private Long facilityId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private Integer expectedAttendees;
}