package com.Authentication.BACKEND.Repository;

import com.Authentication.BACKEND.Entity.TechnicianEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TechnicianRepository extends JpaRepository<TechnicianEntity, Long> {

    Optional<TechnicianEntity> findByEmail(String email);
}