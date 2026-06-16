package com.Authentication.BACKEND.Io.Booking;

import lombok.AllArgsConstructor;
import lombok.Data;
//final available slot response file
@Data
@AllArgsConstructor
public class AvailableSlotResponse {
    private String startTime;
    private String endTime;
    private boolean available;
}