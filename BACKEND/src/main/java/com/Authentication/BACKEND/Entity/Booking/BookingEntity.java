package com.Authentication.BACKEND.Entity.Booking;

import com.Authentication.BACKEND.Entity.Facility.FacilityEntity;
import com.Authentication.BACKEND.Entity.UserEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Who booked
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    // Which facility
    @ManyToOne
    @JoinColumn(name = "facility_id", nullable = false)
    private FacilityEntity facility;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private String purpose;
    private Integer expectedAttendees;

    @Enumerated(EnumType.STRING)
    private BookingStatus status = BookingStatus.PENDING;

    private String adminReason;

    private LocalDateTime createdAt = LocalDateTime.now();
}