package com.Authentication.BACKEND.Repository.Ticket;

import com.Authentication.BACKEND.Entity.Ticket.TicketComment;
import com.Authentication.BACKEND.Entity.Ticket.TicketEntity;
import com.Authentication.BACKEND.Entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketCommentRepository extends JpaRepository <TicketComment, Long> {

    List<TicketComment>findByTicketId(Long ticketId);

    void deleteByTicketIn(List<TicketEntity> tickets);

    void deleteByUser(UserEntity user);
    
}
