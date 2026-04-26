package com.Authentication.BACKEND.Repository.Ticket;

import com.Authentication.BACKEND.Entity.Ticket.TicketEntity;
import com.Authentication.BACKEND.Entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
//repository for ticket entity, extends JpaRepository to provide CRUD operations and custom query methods to find tickets by creator and assignee
public interface TicketRepository  extends JpaRepository<TicketEntity , Long> {
    List<TicketEntity> findByCreatedBy(UserEntity user);

    List<TicketEntity> findByAssignedTo(UserEntity user);

}