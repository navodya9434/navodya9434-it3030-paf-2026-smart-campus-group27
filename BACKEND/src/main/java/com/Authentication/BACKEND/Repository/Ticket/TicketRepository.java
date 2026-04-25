package com.Authentication.BACKEND.Repository.Ticket;

import com.Authentication.BACKEND.Entity.Ticket.TicketEntity;
import com.Authentication.BACKEND.Entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository  extends JpaRepository<TicketEntity , Long> {
    List<TicketEntity> findByCreatedBy(UserEntity user);

    List<TicketEntity> findByAssignedTo(UserEntity user);

}