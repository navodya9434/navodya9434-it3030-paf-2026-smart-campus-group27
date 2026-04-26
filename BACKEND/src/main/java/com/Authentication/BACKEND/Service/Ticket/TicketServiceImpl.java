package com.Authentication.BACKEND.Service.Ticket;


import com.Authentication.BACKEND.Entity.Ticket.TicketComment;
import com.Authentication.BACKEND.Entity.Ticket.TicketEntity;
import com.Authentication.BACKEND.Entity.UserEntity;
import com.Authentication.BACKEND.Io.Ticket.CommentRequest;
import com.Authentication.BACKEND.Io.Ticket.CommentResponseDTO;
import com.Authentication.BACKEND.Io.Ticket.TicketRequest;
import com.Authentication.BACKEND.Io.Ticket.TicketResponse;
import com.Authentication.BACKEND.Repository.Ticket.TicketCommentRepository;
import com.Authentication.BACKEND.Repository.Ticket.TicketRepository;
import com.Authentication.BACKEND.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.Authentication.BACKEND.Service.EmailService;
import com.Authentication.BACKEND.Entity.TechnicianEntity;
import com.Authentication.BACKEND.Repository.TechnicianRepository;

import java.util.List;
import java.util.stream.Collectors;

//ticket service implementation file with added functionalities for comment management and retrieval of all tickets for admin users

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements  TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final TechnicianRepository technicianRepository;

private void sendAssignmentEmail(TicketEntity ticket, TechnicianEntity tech) {

    String subject = "🚨 New Ticket Assigned - " + ticket.getTitle();

    StringBuilder body = new StringBuilder();

    body.append("<h2>🚨 You Have Been Assigned a New Ticket</h2>");

    body.append("<p><b>Technician:</b> ")
            .append(tech.getUsername())
            .append("</p>");

    body.append("<hr>");

    body.append("<h3>📌 Ticket Details</h3>");
    body.append("<p><b>ID:</b> ").append(ticket.getId()).append("</p>");
    body.append("<p><b>Title:</b> ").append(ticket.getTitle()).append("</p>");
    body.append("<p><b>Description:</b> ").append(ticket.getDescription()).append("</p>");
    body.append("<p><b>Category:</b> ").append(ticket.getCategory()).append("</p>");
    body.append("<p><b>Location:</b> ").append(ticket.getLocation()).append("</p>");
    body.append("<p><b>Priority:</b> ").append(ticket.getPriority()).append("</p>");
    body.append("<p><b>Status:</b> ").append(ticket.getStatus()).append("</p>");
    body.append("<p><b>Contact Email:</b> ").append(ticket.getContactEmail()).append("</p>");
    body.append("<p><b>Contact Phone:</b> ").append(ticket.getContactPhone()).append("</p>");
    body.append("<p><b>Created At:</b> ").append(ticket.getCreatedAt()).append("</p>");

    body.append("<hr>");

    // ✅ IMAGES
    if (ticket.getImageUrls() != null && !ticket.getImageUrls().isEmpty()) {
        body.append("<h3>📷 Attached Images</h3>");
        for (String img : ticket.getImageUrls()) {
            body.append("<img src='")
                    .append(img)
                    .append("' width='250' style='margin:10px;border-radius:8px;'/>");
        }
    }

    body.append("<hr>");
    body.append("<p>⚡ Please attend this ticket as soon as possible.</p>");

    emailService.sendHtmlEmail(tech.getEmail(), subject, body.toString());
}
    @Override
    public TicketResponse createTicket(String email, TicketRequest request) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(()-> new RuntimeException("user not found with email :" + email));

        if (request.getImageUrls() != null && request.getImageUrls().size() > 3) {
            throw new RuntimeException("Max 3 images allowed");
        }

        TicketEntity ticket = TicketEntity.builder()
                .title(request.getTitle())
                .category(request.getCategory())
                .description(request.getDescription())
                .location(request.getLocation())
                .priority(request.getPriority())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .imageUrls(request.getImageUrls())
                .createdBy(user)
                .status("OPEN")
                .build();

        TicketEntity saved = ticketRepository.save(ticket);
        return  map(saved);
    }

    @Override
    public List<TicketResponse> getMyTickets(String email) {
        UserEntity user = userRepository.findByEmail(email).orElseThrow();

        return ticketRepository.findByCreatedBy(user)
                .stream().map(this::map)
                .collect(Collectors.toList());
    }

    @Override
    public TicketResponse updateStatus(Long ticketId, String status, String reason) {
        TicketEntity ticket = ticketRepository.findById(ticketId).orElseThrow();

        ticket.setStatus(status);

        if ("REJECTED".equals(status)) {
            ticket.setRejectionReason(reason);
        }
        return map(ticketRepository.save(ticket));
    }

   @Override
public TicketResponse assignTechnician(Long ticketId, String technicianEmail) {

    TicketEntity ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));

    TechnicianEntity tech = technicianRepository.findByEmail(technicianEmail)
            .orElseThrow(() -> new RuntimeException("Technician not found"));

    ticket.setAssignedTo(tech); // 🔥 REQUIRED FIX
    ticket.setStatus("IN_PROGRESS");

    TicketEntity saved = ticketRepository.save(ticket);

    sendAssignmentEmail(saved, tech);

    return map(saved);
}
@Override
public void addComment(Long ticketId, String email, CommentRequest request) {

    UserEntity user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    TicketEntity ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));

    TicketComment comment = TicketComment.builder()
            .message(request.getMessage())
            .ticket(ticket)
            .user(user) // ✅ THIS IS THE CORRECT USER ID SOURCE
            .build();

    commentRepository.save(comment);
}

    private TicketResponse map(TicketEntity t) {
        return TicketResponse.builder()
                .id(t.getId())
                .title(t.getTitle())
                .category(t.getCategory())
                .description(t.getDescription())
                .location(t.getLocation())
                .priority(t.getPriority())
                .status(t.getStatus())
                .contactEmail(t.getContactEmail())
                .contactPhone(t.getContactPhone())
                .createdBy(t.getCreatedBy().getEmail())
                .assignedTo(t.getAssignedTo() != null ? t.getAssignedTo().getEmail() : null)
                .imageUrls(t.getImageUrls())
                .createdAt(t.getCreatedAt())
                .build();
    }


    @Override
    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll()
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }
@Override
public List<CommentResponseDTO> getCommentsByTicket(Long ticketId) {

    List<TicketComment> comments = commentRepository.findByTicketId(ticketId);

    return comments.stream().map(c ->
        CommentResponseDTO.builder()
            .id(c.getId())
            .message(c.getMessage())
            .ticketId(c.getTicket().getId())
            .userId(c.getUser().getId())
            .userName(c.getUser().getEmail())
            .createdAt(c.getCreatedAt())
            .build()
    ).collect(Collectors.toList());
}


        @Override
public void updateComment(Long commentId, String email, String message) {

    UserEntity user = userRepository.findByEmail(email).orElseThrow();

    TicketComment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));

    boolean isOwner = comment.getUser().getId().equals(user.getId());
    boolean isAdmin = "ADMIN".equals(user.getRole());

    if (!isOwner && !isAdmin) {
        throw new RuntimeException("Not allowed");
    }

    comment.setMessage(message);
    commentRepository.save(comment);
}
@Override
public void deleteComment(Long commentId, String email) {

    UserEntity user = userRepository.findByEmail(email).orElseThrow();

    TicketComment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));

    boolean isOwner = comment.getUser().getId().equals(user.getId());
    boolean isAdmin = user.getRole() != null && user.getRole().equals("ADMIN");

    if (!isOwner && !isAdmin) {
        throw new RuntimeException("Not allowed to delete this comment");
    }

    commentRepository.delete(comment);
}

}
