package com.Authentication.BACKEND.Entity.Ticket;

import com.Authentication.BACKEND.Entity.UserEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_alerts")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TicketAlertEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;

    private String location;

    private String status; 
    // ACTIVE, RESOLVED

    private String targetRole;
    // BOOKING_MANAGER, FACILITY_MANAGER

    @ManyToOne
    @JoinColumn(name = "ticket_id")
    private TicketEntity ticket;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private UserEntity createdBy;

    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.status = "ACTIVE";
    }
}