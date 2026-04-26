package com.Authentication.BACKEND.Repository.Ticket;

import com.Authentication.BACKEND.Entity.Ticket.TicketAlertEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
//repository for ticket alert entity, extends JpaRepository to provide CRUD operations and custom query methods to find alerts by status, target role and status, and ticket ID
public interface TicketAlertRepository extends JpaRepository<TicketAlertEntity, Long> {

    List<TicketAlertEntity> findByStatus(String status);

    List<TicketAlertEntity> findByTargetRoleAndStatus(String role, String status);

    List<TicketAlertEntity> findByTicketId(Long ticketId);
}