package com.Authentication.BACKEND.Entity.Facility;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;


@Entity
@Table(name = "facilities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FacilityEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Facility name cannot be blank")
    @Column(nullable = false, unique = true)
    private String name;

    @NotBlank(message = "Description cannot be blank")
    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Facility type cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FacilityType type;

    @NotNull(message = "Capacity cannot be null")
    @Positive(message = "Capacity must be positive")
    @Column(nullable = false)
    private Integer capacity;

    @NotBlank(message = "Location cannot be blank")
    @Column(nullable = false)
    private String location;

    @NotNull(message = "Status cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FacilityStatus status = FacilityStatus.ACTIVE;

    @Column(columnDefinition = "JSON")
    private String amenities; // JSON array: ["WiFi", "Projector", "AC", ...]

    @Column(columnDefinition = "JSON")
    private String availabilityWindows; // JSON array: [{"dayOfWeek": "MONDAY", "startTime": "09:00", "endTime": "17:00"}, ...]

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "contact_person")
    private String contactPerson;

    @Column(name = "contact_phone")
    private String contactPhone;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private String createdBy; // User email who created

    @Column(name = "updated_by")
    private String updatedBy; //
}