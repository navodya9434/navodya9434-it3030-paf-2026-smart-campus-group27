package com.Authentication.BACKEND.Controller.Ticket;


import com.Authentication.BACKEND.Io.Ticket.CommentRequest;
import com.Authentication.BACKEND.Io.Ticket.CommentResponseDTO;
import com.Authentication.BACKEND.Io.Ticket.TicketRequest;
import com.Authentication.BACKEND.Io.Ticket.TicketResponse;
import com.Authentication.BACKEND.Repository.UserRepository;
import com.Authentication.BACKEND.Service.Ticket.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final UserRepository userRepository;

    private String requireEmail(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof OAuth2User oauth2User) {
            Object emailAttribute = oauth2User.getAttributes().get("email");
            if (emailAttribute != null) {
                String principalEmail = emailAttribute.toString();
                if (!principalEmail.isBlank() && principalEmail.contains("@")) {
                    return principalEmail;
                }
            }
        }

        String authName = authentication.getName();

        if (authName.contains("@")) {
            return authName;
        }

        return userRepository.findByUserId(authName)
                .map(user -> user.getEmail())
                .or(() -> userRepository.findByEmail(authName).map(user -> user.getEmail()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unable to resolve user email"));
    }

    @PostMapping
    public TicketResponse create(
            @RequestBody TicketRequest request,
            Authentication authentication
    ) {
        return ticketService.createTicket(requireEmail(authentication), request);
    }

    @GetMapping("/my")
    public List<TicketResponse> myTickets(
            Authentication authentication
    ) {
        return ticketService.getMyTickets(requireEmail(authentication));
    }

    @PutMapping("/{id}/status")
    public TicketResponse updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String reason
    ) {
        return ticketService.updateStatus(id, status, reason);
    }

    @PutMapping("/{id}/assign")
    public TicketResponse assign(
            @PathVariable Long id,
            @RequestParam String technicianEmail
    ) {
        return ticketService.assignTechnician(id, technicianEmail);
    }

    @PostMapping("/{id}/comment")
    public void comment(
            @PathVariable Long id,
            @RequestBody CommentRequest request,
            Authentication authentication
    ) {
        ticketService.addComment(id, requireEmail(authentication), request);
    }

    @GetMapping("/all")
    public List<TicketResponse> getAllTickets() {
        return ticketService.getAllTickets();
    }

@GetMapping("/{id}/comments")
public List<CommentResponseDTO> getComments(@PathVariable Long id) {
    return ticketService.getCommentsByTicket(id);
}
@PutMapping("/comment/{commentId}")
public void updateComment(
        @PathVariable Long commentId,
        @RequestBody CommentRequest request,
        Authentication authentication
) {
    ticketService.updateComment(commentId, requireEmail(authentication), request.getMessage());
}
@DeleteMapping("/comment/{commentId}")
public void deleteComment(
        @PathVariable Long commentId,
        Authentication authentication
) {
    ticketService.deleteComment(commentId, requireEmail(authentication));
}



}
