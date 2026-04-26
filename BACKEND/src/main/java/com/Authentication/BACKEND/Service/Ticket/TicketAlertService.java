package com.Authentication.BACKEND.Service.Ticket;

import com.Authentication.BACKEND.Io.Ticket.TicketAlertResponse;

import java.util.List;

public interface TicketAlertService {

    void sendTicketAlert(Long ticketId);

    List<TicketAlertResponse> getAlertsForRole(String role);

    void resolveAlert(Long alertId);
}