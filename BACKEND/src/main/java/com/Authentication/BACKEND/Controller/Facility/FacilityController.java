package com.Authentication.BACKEND.Controller.Facility;

import com.Authentication.BACKEND.Entity.Facility.FacilityStatus;
import com.Authentication.BACKEND.Entity.Facility.FacilityType;
import com.Authentication.BACKEND.Io.Facility.FacilityRequest;
import com.Authentication.BACKEND.Io.Facility.FacilityResponse;
import com.Authentication.BACKEND.Service.Facility.FacilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/facilities")
@RequiredArgsConstructor
public class FacilityController {

    private final FacilityService facilityService;

    @PostMapping
    @PreAuthorize("hasRole('FACILITIES_MANAGER')")
    public ResponseEntity<?> createFacility(
            @Valid @RequestBody FacilityRequest request,
            @CurrentSecurityContext(expression = "authentication?.name") String email) {
        try {
            FacilityResponse response = facilityService.createFacility(request, email);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'FACILITIES_MANAGER')")
    public ResponseEntity<?> getFacilityById(@PathVariable Long id) {
        try {
            FacilityResponse response = facilityService.getFacilityById(id);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

        @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'FACILITIES_MANAGER')")
    public ResponseEntity<?> getAllFacilities() {
        try {
            List<FacilityResponse> facilities = facilityService.getAllFacilities();
            return ResponseEntity.ok(facilities);
        } catch (Exception ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }


    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('USER', 'FACILITIES_MANAGER')")
    public ResponseEntity<?> searchFacilities(@RequestParam String searchTerm) {
        try {
            List<FacilityResponse> results = facilityService.searchFacilities(searchTerm);
            return ResponseEntity.ok(results);
        } catch (Exception ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/filter/type")
    @PreAuthorize("hasAnyRole('USER', 'FACILITIES_MANAGER')")
    public ResponseEntity<?> filterByType(@RequestParam FacilityType type) {
        try {
            List<FacilityResponse> results = facilityService.filterByType(type);
            return ResponseEntity.ok(results);
        } catch (Exception ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/filter/location")
    @PreAuthorize("hasAnyRole('USER', 'FACILITIES_MANAGER')")
    public ResponseEntity<?> filterByLocation(@RequestParam String location) {
        try {
            List<FacilityResponse> results = facilityService.filterByLocation(location);
            return ResponseEntity.ok(results);
        } catch (Exception ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/filter/status")
    @PreAuthorize("hasAnyRole('USER', 'FACILITIES_MANAGER')")
    public ResponseEntity<?> filterByStatus(@RequestParam FacilityStatus status) {
        try {
            List<FacilityResponse> results = facilityService.filterByStatus(status);
            return ResponseEntity.ok(results);
        } catch (Exception ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }


    @GetMapping("/filter/capacity")
    @PreAuthorize("hasAnyRole('USER', 'FACILITIES_MANAGER')")
    public ResponseEntity<?> filterByCapacity(@RequestParam Integer minCapacity) {
        try {
            List<FacilityResponse> results = facilityService.filterByCapacity(minCapacity);
            return ResponseEntity.ok(results);
        } catch (Exception ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/filter/multi")
    @PreAuthorize("hasAnyRole('USER', 'FACILITIES_MANAGER')")
    public ResponseEntity<?> filterByMultiple(
            @RequestParam(required = false) FacilityType type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) FacilityStatus status,
            @RequestParam(required = false) Integer minCapacity) {
        try {
            List<FacilityResponse> results = facilityService.filterByMultiple(type, location, status, minCapacity);
            return ResponseEntity.ok(results);
        } catch (Exception ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/suitable")
    @PreAuthorize("hasAnyRole('USER', 'FACILITIES_MANAGER')")
    public ResponseEntity<?> findSuitableFacilities(
            @RequestParam FacilityType type,
            @RequestParam Integer requiredCapacity) {
        try {
            List<FacilityResponse> results = facilityService.findSuitableFacilities(type, requiredCapacity);
            return ResponseEntity.ok(results);
        } catch (Exception ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FACILITIES_MANAGER')")
    public ResponseEntity<?> updateFacility(
            @PathVariable Long id,
            @Valid @RequestBody FacilityRequest request,
            @CurrentSecurityContext(expression = "authentication?.name") String email) {
        try {
            FacilityResponse response = facilityService.updateFacility(id, request, email);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    @PatchMapping("/{id}/availability")
    @PreAuthorize("hasRole('FACILITIES_MANAGER')")
    public ResponseEntity<?> updateAvailability(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            @CurrentSecurityContext(expression = "authentication?.name") String email) {
        try {
            String availabilityWindows = request.get("availabilityWindows");
            facilityService.updateAvailability(id, availabilityWindows, email);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Availability updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('FACILITIES_MANAGER')")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            @CurrentSecurityContext(expression = "authentication?.name") String email) {
        try {
            FacilityStatus status = FacilityStatus.valueOf(request.get("status"));
            facilityService.updateStatus(id, status, email);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Status updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FACILITIES_MANAGER')")
    public ResponseEntity<?> deleteFacility(@PathVariable Long id) {
        try {
            facilityService.deleteFacility(id);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Facility deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }



}