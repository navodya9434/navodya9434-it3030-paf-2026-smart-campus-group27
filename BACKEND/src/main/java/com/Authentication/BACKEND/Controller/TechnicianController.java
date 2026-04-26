package com.Authentication.BACKEND.Controller;

import com.Authentication.BACKEND.Entity.TechnicianEntity;
import com.Authentication.BACKEND.Repository.TechnicianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/technicians")
@RequiredArgsConstructor
public class TechnicianController {

    private final TechnicianRepository technicianRepository;

    // ✅ Get all technicians (for dropdown in frontend)
    @GetMapping("/all")
    public List<TechnicianEntity> getAllTechnicians() {
        return technicianRepository.findAll();
    }
}