package com.Authentication.BACKEND.Entity.Booking;

import java.time.LocalDateTime;

import com.Authentication.BACKEND.Entity.Facility.FacilityEntity;
import com.Authentication.BACKEND.Entity.UserEntity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
//booking entity file
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