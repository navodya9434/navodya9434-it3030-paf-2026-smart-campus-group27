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
