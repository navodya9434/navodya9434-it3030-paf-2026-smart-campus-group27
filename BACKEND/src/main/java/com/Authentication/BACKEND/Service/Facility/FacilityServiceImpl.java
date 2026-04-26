package com.Authentication.BACKEND.Service.Facility;


import com.Authentication.BACKEND.Entity.Facility.FacilityEntity;
import com.Authentication.BACKEND.Entity.Facility.FacilityStatus;
import com.Authentication.BACKEND.Entity.Facility.FacilityType;
import com.Authentication.BACKEND.Io.Facility.FacilityRequest;
import com.Authentication.BACKEND.Io.Facility.FacilityResponse;
import com.Authentication.BACKEND.Repository.Facility.FacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collector;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacilityServiceImpl implements  FacilityService {

    private final FacilityRepository facilityRepository;


    @Override
    public FacilityResponse createFacility(FacilityRequest request, String createdBy) {
        // Check if facility with same name already exists
        if (facilityRepository.existsByName(request.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Facility with name '" + request.getName() + "' already exists");
        }
        FacilityEntity facility = new FacilityEntity();
        facility.setName(request.getName());
        facility.setDescription(request.getDescription());
        facility.setType(request.getType());
        facility.setCapacity(request.getCapacity());
        facility.setLocation(request.getLocation());
        facility.setStatus(request.getStatus() != null ? request.getStatus() : FacilityStatus.ACTIVE);
        facility.setAmenities(request.getAmenities());
        facility.setAvailabilityWindows(request.getAvailabilityWindows());
        facility.setNotes(request.getNotes());
        facility.setContactPerson(request.getContactPerson());
        facility.setContactPhone(request.getContactPhone());
        facility.setCreatedBy(createdBy);
        facility.setUpdatedBy(createdBy);

        FacilityEntity savedFacility = facilityRepository.save(facility);
        return convertToResponse(savedFacility);
    }

    @Override
    public FacilityResponse getFacilityById(Long id) {
        FacilityEntity facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Facility not found with id: " + id));
        return convertToResponse(facility);
    }

    @Override
    public List<FacilityResponse> getAllFacilities() {
        return facilityRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

    }

    @Override
    public FacilityResponse updateFacility(Long id, FacilityRequest request, String updatedBy) {
        FacilityEntity facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Facility not found with id: " + id));

        // Update fields
        facility.setName(request.getName());
        facility.setDescription(request.getDescription());
        facility.setType(request.getType());
        facility.setCapacity(request.getCapacity());
        facility.setLocation(request.getLocation());
        if (request.getStatus() != null) {
            facility.setStatus(request.getStatus());
        }
        facility.setAmenities(request.getAmenities());
        facility.setAvailabilityWindows(request.getAvailabilityWindows());
        facility.setNotes(request.getNotes());
        facility.setContactPerson(request.getContactPerson());
        facility.setContactPhone(request.getContactPhone());
        facility.setUpdatedBy(updatedBy);

        FacilityEntity updatedFacility = facilityRepository.save(facility);
        return convertToResponse(updatedFacility);
    }

    @Override
    public void deleteFacility(Long id) {
        if (!facilityRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Facility not found with id: " + id);
        }
        facilityRepository.deleteById(id);

    }

    @Override
    public List<FacilityResponse> searchFacilities(String searchTerm) {
        if (searchTerm == null || searchTerm.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Search term cannot be empty");
        }
        return facilityRepository.searchFacilities(searchTerm)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

    }

    @Override
    public List<FacilityResponse> filterByType(FacilityType type) {
        return facilityRepository.findByType(type)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

    }

    @Override
    public List<FacilityResponse> filterByLocation(String location) {
        return facilityRepository.findByLocation(location)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

    }

    @Override
    public List<FacilityResponse> filterByStatus(FacilityStatus status) {
        return facilityRepository.findByStatus(status)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

    }

    @Override
    public List<FacilityResponse> filterByCapacity(Integer minCapacity) {
        if (minCapacity == null || minCapacity <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Capacity must be greater than 0");
        }
        return facilityRepository.findByCapacityGreaterThanEqual(minCapacity)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FacilityResponse> filterByMultiple(FacilityType type, String location, FacilityStatus status, Integer minCapacity) {
        List<FacilityEntity> results = facilityRepository.findAll();

        if (type != null) {
            results = results.stream()
                    .filter(f -> f.getType() == type)
                    .collect(Collectors.toList());
        }

        if (location != null && !location.isBlank()) {
            results = results.stream()
                    .filter(f -> f.getLocation().equalsIgnoreCase(location))
                    .collect(Collectors.toList());
        }

        if (status != null) {
            results = results.stream()
                    .filter(f -> f.getStatus() == status)
                    .collect(Collectors.toList());
        }

        if (minCapacity != null && minCapacity > 0) {
            results = results.stream()
                    .filter(f -> f.getCapacity() >= minCapacity)
                    .collect(Collectors.toList());
        }

        return results.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void updateAvailability(Long id, String availabilityWindows, String updatedBy) {
        FacilityEntity facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Facility not found with id: " + id));

        facility.setAvailabilityWindows(availabilityWindows);
        facility.setUpdatedBy(updatedBy);
        facilityRepository.save(facility);
    }

    @Override
    public void updateStatus(Long id, FacilityStatus status, String updatedBy) {
        FacilityEntity facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Facility not found with id: " + id));

        facility.setStatus(status);
        facility.setUpdatedBy(updatedBy);
        facilityRepository.save(facility);
    }

    @Override
    public List<FacilityResponse> findSuitableFacilities(FacilityType type, Integer requiredCapacity) {
        if (type == null || requiredCapacity == null || requiredCapacity <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type and required capacity must be provided");
        }
        return facilityRepository.findSuitableFacilities(type, FacilityStatus.ACTIVE, requiredCapacity)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Helper method to convert Entity to Response
    private FacilityResponse convertToResponse(FacilityEntity facility) {
        return new FacilityResponse(
                facility.getId(),
                facility.getName(),
                facility.getDescription(),
                facility.getType(),
                facility.getCapacity(),
                facility.getLocation(),
                facility.getStatus(),
                facility.getAmenities(),
                facility.getAvailabilityWindows(),
                facility.getNotes(),
                facility.getContactPerson(),
                facility.getContactPhone(),
                facility.getCreatedAt(),
                facility.getUpdatedAt(),
                facility.getCreatedBy(),
                facility.getUpdatedBy()
        );

}


}

