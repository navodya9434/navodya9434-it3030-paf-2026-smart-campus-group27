package com.Authentication.BACKEND.Io.Facility;


import com.Authentication.BACKEND.Entity.Facility.FacilityStatus;
import com.Authentication.BACKEND.Entity.Facility.FacilityType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FacilityResponse {

    private Long id;

    private String name;

    private String description;

    private FacilityType type;

    private Integer capacity;

    private String location;

    private FacilityStatus status;

    private String amenities;

    private String availabilityWindows;

    private String notes;

    private String contactPerson;

    private String contactPhone;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdBy;

    private String updatedBy;
}

