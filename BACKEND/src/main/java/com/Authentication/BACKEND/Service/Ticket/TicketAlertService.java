package com.Authentication.BACKEND.Service.Ticket;

import com.Authentication.BACKEND.Io.Ticket.TicketAlertResponse;

import java.util.List;
//service interface for managing ticket alerts, including sending alerts, retrieving alerts based on user roles, and resolving alerts

public interface TicketAlertService {

    void sendTicketAlert(Long ticketId);

    List<TicketAlertResponse> getAlertsForRole(String role);

    void resolveAlert(Long alertId);
    void resolveAlertsByTicketId(Long ticketId);
}