package com.Authentication.BACKEND.Service.Facility;

package com.Authentication.BACKEND.Service.Facility;

import com.Authentication.BACKEND.Entity.Facility.FacilityStatus;
import com.Authentication.BACKEND.Entity.Facility.FacilityType;
import com.Authentication.BACKEND.Io.Facility.FacilityRequest;
import com.Authentication.BACKEND.Io.Facility.FacilityResponse;

import java.util.List;

public interface FacilityService {

    // Create
    FacilityResponse createFacility(FacilityRequest request, String createdBy);

    // Read
    FacilityResponse getFacilityById(Long id);

    List<FacilityResponse> getAllFacilities();

    // Update
    FacilityResponse updateFacility(Long id, FacilityRequest request, String updatedBy);

    // Delete
    void deleteFacility(Long id);

    List<FacilityResponse> searchFacilities(String searchTerm);

    List<FacilityResponse> filterByType(FacilityType type);

    List<FacilityResponse> filterByLocation(String location);

    List<FacilityResponse> filterByStatus(FacilityStatus status);

    List<FacilityResponse> filterByCapacity(Integer minCapacity);

    List<FacilityResponse> filterByMultiple(FacilityType type, String location, FacilityStatus status, Integer minCapacity);

    // Availability Management
    void updateAvailability(Long id, String availabilityWindows, String updatedBy);

    // Status Management
    void updateStatus(Long id, FacilityStatus status, String updatedBy);

    // Get suitable facilities for booking
    List<FacilityResponse> findSuitableFacilities(FacilityType type, Integer requiredCapacity);


}

