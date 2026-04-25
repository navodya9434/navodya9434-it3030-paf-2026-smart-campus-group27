package com.Authentication.BACKEND.Io.Ticket;

import lombok.Data;

import java.util.List;

@Data
public class TicketRequest {

    private String title;
    private String category;
    private String description;
    private String location;
    private String priority;
    private String contactEmail;
    private String contactPhone;
    private List<String> imageUrls;
}
