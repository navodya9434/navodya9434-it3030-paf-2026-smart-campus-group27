package com.Authentication.BACKEND.Io.Ticket;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

//dto for ticket response
@Data
@Builder
public class TicketResponse {

    private Long id;
    private String title;
    private String category;
    private String description;
    private String location;
    private String priority;
    private String status;

    private String contactEmail;
    private String contactPhone;

    private String createdBy;
    private String assignedTo;

    private List<String> imageUrls;

    private LocalDateTime createdAt;
}
