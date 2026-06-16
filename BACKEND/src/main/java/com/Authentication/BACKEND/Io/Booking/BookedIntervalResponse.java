package com.Authentication.BACKEND.Io.Booking;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
//final booked interval response file
@Data
@AllArgsConstructor
public class BookedIntervalResponse {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}