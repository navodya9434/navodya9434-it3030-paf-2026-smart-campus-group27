package com.Authentication.BACKEND.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;
//Entity file for technicians, which will be used to store technician information in the database. It includes fields for id, username, email, password, availability, and createdAt timestamp. The class is annotated with JPA annotations to specify the table name and column properties, and Lombok annotations to generate boilerplate code like getters, setters, constructors, and builders.
@Entity
@Table(name = "technicians")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechnicianEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    private Boolean availability = true;

    private Timestamp createdAt;
}