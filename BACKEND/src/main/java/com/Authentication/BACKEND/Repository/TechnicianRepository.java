package com.Authentication.BACKEND.Repository;

import com.Authentication.BACKEND.Entity.TechnicianEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
//repository for technician entity, extends JpaRepository to provide CRUD operations and custom query method to find technician by email

public interface TechnicianRepository extends JpaRepository<TechnicianEntity, Long> {

    Optional<TechnicianEntity> findByEmail(String email);
}