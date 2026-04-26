package com.Authentication.BACKEND.Service.Ticket;

import com.Authentication.BACKEND.Io.Ticket.CommentRequest;
import com.Authentication.BACKEND.Io.Ticket.CommentResponseDTO;
import com.Authentication.BACKEND.Io.Ticket.TicketRequest;
import com.Authentication.BACKEND.Io.Ticket.TicketResponse;

import java.util.List;
//imprvoved service file with comment management and ticket retrieval for all users
public interface TicketService {

    TicketResponse createTicket(String email, TicketRequest request);

    List<TicketResponse> getMyTickets(String email);

    TicketResponse updateStatus(Long ticketId, String status, String reason);

    TicketResponse assignTechnician(Long ticketId, String technicianEmail);

    void addComment(Long ticketId, String email, CommentRequest request);
    List<TicketResponse> getAllTickets();
List<CommentResponseDTO> getCommentsByTicket(Long ticketId);
void updateComment(Long commentId, String email, String message);
void deleteComment(Long commentId, String email);


}
