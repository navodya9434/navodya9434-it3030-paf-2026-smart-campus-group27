package com.Authentication.BACKEND.Io.Ticket;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
//dto for comment response, contains all the necessary information about a comment to be sent back to the client
@Data
@Builder
public class CommentResponseDTO {

    private Long id;
    private String message;

    private Long userId;
    private String userName;

    private Long ticketId;

    private LocalDateTime createdAt;
}
