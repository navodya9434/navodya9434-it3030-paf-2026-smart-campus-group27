package com.Authentication.BACKEND.Service.Booking;

import com.Authentication.BACKEND.Entity.Booking.BookingEntity;
import com.Authentication.BACKEND.Entity.Booking.BookingStatus;
import com.Authentication.BACKEND.Entity.Facility.FacilityEntity;
import com.Authentication.BACKEND.Entity.UserEntity;
import com.Authentication.BACKEND.Io.Booking.AvailableSlotResponse;
import com.Authentication.BACKEND.Io.Booking.BookedIntervalResponse;
import com.Authentication.BACKEND.Io.Booking.BookingRequest;
import com.Authentication.BACKEND.Io.Booking.BookingResponse;
import com.Authentication.BACKEND.Repository.Booking.BookingRepository;
import com.Authentication.BACKEND.Repository.Facility.FacilityRepository;
import com.Authentication.BACKEND.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
//final booking service implementation
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final FacilityRepository facilityRepository;
    private final UserRepository userRepository;

    @Override
    public BookingResponse createBooking(String email, BookingRequest request) {

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FacilityEntity facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new RuntimeException("Facility not found"));

        // ❌ Conflict check (IMPORTANT RULE)
        boolean conflict = bookingRepository
                .existsByFacility_IdAndStartTimeLessThanAndEndTimeGreaterThan(
                        facility.getId(),
                        request.getEndTime(),
                        request.getStartTime()
                );

        if (conflict) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Time slot already booked");
        }

        BookingEntity booking = new BookingEntity();
        booking.setUser(user);
        booking.setFacility(facility);
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);

        return map(bookingRepository.save(booking));
    }

    @Override
    public List<BookingResponse> getMyBookings(String email) {
        return bookingRepository.findByUser_Email(email)
                .stream().map(this::map).collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream().map(this::map).collect(Collectors.toList());
    }

    @Override
    public BookingResponse updateStatus(Long id, String status, String reason) {

        BookingEntity booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(BookingStatus.valueOf(status));
        booking.setAdminReason(reason);

        return map(bookingRepository.save(booking));
    }

    @Override
    public void cancelBooking(Long id, String email) {

        BookingEntity booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("Not your booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    private BookingResponse map(BookingEntity b) {
        return new BookingResponse(
                b.getId(),
                b.getFacility().getId(),
                b.getFacility().getName(),
                b.getUser().getEmail(),
                b.getStartTime(),
                b.getEndTime(),
                b.getPurpose(),
                b.getExpectedAttendees(),
                b.getStatus(),
                b.getAdminReason()
        );
    }
    @Override
public List<AvailableSlotResponse> getAvailableSlots(Long facilityId, String date) {

    FacilityEntity facility = facilityRepository.findById(facilityId)
            .orElseThrow(() -> new RuntimeException("Facility not found"));

    LocalDate localDate = LocalDate.parse(date);

    // working hours example: 08:00 - 18:00
    List<AvailableSlotResponse> slots = new ArrayList<>();

    for (int hour = 8; hour < 18; hour++) {

        LocalDateTime start = localDate.atTime(hour, 0);
        LocalDateTime end = localDate.atTime(hour + 1, 0);

        boolean conflict = bookingRepository
                .existsByFacility_IdAndStartTimeLessThanAndEndTimeGreaterThan(
                        facilityId, end, start
                );

        slots.add(new AvailableSlotResponse(
                start.toString(),
                end.toString(),
                !conflict
        ));
    }

    return slots;
}
@Override
public List<BookingResponse> getBookingsByFacilityAndDate(Long facilityId, String date) {

    return bookingRepository.findAll()
            .stream()
            .filter(b ->
                    b.getFacility().getId().equals(facilityId) &&
                    b.getStartTime().toString().startsWith(date) &&
                    !b.getStatus().name().equals("CANCELLED")
            )
            .map(this::map)
            .collect(Collectors.toList());
}
@Override
public List<BookedIntervalResponse> getBookedIntervals(Long facilityId, String date) {

    LocalDate localDate = LocalDate.parse(date);

    return bookingRepository.findAll()
            .stream()
            .filter(b ->
                    b.getFacility().getId().equals(facilityId) &&
                    b.getStartTime().toLocalDate().equals(localDate) &&
                    !b.getStatus().name().equals("CANCELLED")
            )
            .map(b -> new BookedIntervalResponse(
                    b.getStartTime(),
                    b.getEndTime()
            ))
            .collect(Collectors.toList());
}
}