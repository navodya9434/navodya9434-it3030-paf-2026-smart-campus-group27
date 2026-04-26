package com.Authentication.BACKEND.Io.Facility;

import com.Authentication.BACKEND.Entity.Facility.FacilityStatus;
import com.Authentication.BACKEND.Entity.Facility.FacilityType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FacilityRequest {

    @NotBlank(message = "Facility name is required")
    @Size(min = 3, max = 100, message = "Facility name must be between 3 and 100 characters")
    private String name;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 500, message = "Description must be between 10 and 500 characters")
    private String description;

    @NotNull(message = "Facility type is required")
    private FacilityType type;

    @NotNull(message = "Capacity is required")
    @Positive(message = "Capacity must be greater than 0")
    @Max(value = 10000, message = "Capacity cannot exceed 10000")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    @Size(min = 3, max = 100, message = "Location must be between 3 and 100 characters")
    private String location;

    private FacilityStatus status;

    private String amenities; // JSON array as string

    private String availabilityWindows; // JSON array as string

    private String notes;

    private String contactPerson;

    private String contactPhone;
}
