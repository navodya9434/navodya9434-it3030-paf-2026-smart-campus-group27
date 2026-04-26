package com.Authentication.BACKEND.Io.Ticket;

import lombok.*;

import java.time.LocalDateTime;
//dto for ticket alert response
@Data
@Builder
public class TicketAlertResponse {

    private Long id;
    private Long ticketId;
    private String message;
    private String location;
    private String status;
    private String targetRole;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}