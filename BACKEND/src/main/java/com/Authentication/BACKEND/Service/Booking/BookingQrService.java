package com.Authentication.BACKEND.Service.Booking;

import com.Authentication.BACKEND.Entity.Booking.BookingEntity;
import com.Authentication.BACKEND.Repository.Booking.BookingRepository;
import com.Authentication.BACKEND.Util.QRCodeGenerator;
import com.google.zxing.WriterException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class BookingQrService {

    private final BookingRepository bookingRepository;

    public byte[] generateBookingQr(Long bookingId) {

        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // ONLY KEEP BUSINESS RULE (optional)
        if (!booking.getStatus().name().equals("APPROVED")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking not approved yet");
        }

        String qrData =
                "BOOKING_ID:" + booking.getId() +
                "|FACILITY:" + booking.getFacility().getName() +
                "|START:" + booking.getStartTime() +
                "|END:" + booking.getEndTime();

        try {
            return QRCodeGenerator.generateQRCode(qrData, 300, 300);
        } catch (Exception e) {
            throw new RuntimeException("QR generation failed", e);
        }
    }
}