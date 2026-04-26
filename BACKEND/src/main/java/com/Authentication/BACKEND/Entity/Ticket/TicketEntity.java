package com.Authentication.BACKEND.Entity.Ticket;

import com.Authentication.BACKEND.Entity.TechnicianEntity;
import com.Authentication.BACKEND.Entity.UserEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.Authentication.BACKEND.Entity.TechnicianEntity;


@Entity
@Table(name = "tickets")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TicketEntity {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String category;

    @Column(length = 2000)
    private String description;

    private String location;

    private String priority;

    private String status;

    private String rejectionReason;

    private String contactEmail;
    private String contactPhone;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private UserEntity createdBy;

  @ManyToOne
@JoinColumn(name = "assigned_to")
private TechnicianEntity assignedTo;

    @ElementCollection
    private List<String> imageUrls = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.status = "OPEN";
    }
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
