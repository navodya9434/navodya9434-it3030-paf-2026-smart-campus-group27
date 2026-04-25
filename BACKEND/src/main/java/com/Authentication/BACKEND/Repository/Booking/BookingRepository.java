package com.Authentication.BACKEND.Repository.Booking;

import com.Authentication.BACKEND.Entity.Booking.BookingEntity;
import com.Authentication.BACKEND.Entity.Booking.BookingStatus;
import com.Authentication.BACKEND.Io.Booking.AvailableSlotResponse;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<BookingEntity, Long> {

    List<BookingEntity> findByUser_Email(String email);

    List<BookingEntity> findByFacility_Id(Long facilityId);

    List<BookingEntity> findByStatus(BookingStatus status);

    // Conflict check (IMPORTANT)
    boolean existsByFacility_IdAndStartTimeLessThanAndEndTimeGreaterThan(
            Long facilityId,
            LocalDateTime endTime,
            LocalDateTime startTime
    );
}