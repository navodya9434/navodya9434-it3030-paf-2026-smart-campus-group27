package com.Authentication.BACKEND.Repository.Ticket;

import com.Authentication.BACKEND.Entity.Ticket.TicketAlertEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketAlertRepository extends JpaRepository<TicketAlertEntity, Long> {

    List<TicketAlertEntity> findByStatus(String status);

    List<TicketAlertEntity> findByTargetRoleAndStatus(String role, String status);

    List<TicketAlertEntity> findByTicketId(Long ticketId);
}