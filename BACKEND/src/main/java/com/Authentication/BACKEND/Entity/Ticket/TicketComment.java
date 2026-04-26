package com.Authentication.BACKEND.Entity.Ticket;


import com.Authentication.BACKEND.Entity.UserEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_comments")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TicketComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 1500)
    private String message;

@ManyToOne
@JoinColumn(name = "user_id")
private UserEntity user;

    @ManyToOne
    private TicketEntity ticket;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }




}
