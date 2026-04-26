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

