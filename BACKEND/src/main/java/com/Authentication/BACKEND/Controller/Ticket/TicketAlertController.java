package com.Authentication.BACKEND.Controller.Ticket;

import com.Authentication.BACKEND.Io.Ticket.TicketAlertResponse;
import com.Authentication.BACKEND.Service.Ticket.TicketAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
//improved final controller for ticket alerts, added endpoint to resolve alerts by ticket ID, and improved naming conventions for clarity
@RestController
@RequestMapping("/tickets/alert")
@RequiredArgsConstructor
public class TicketAlertController {

    private final TicketAlertService ticketAlertService;

    @PostMapping("/{ticketId}")
    public void sendAlert(@PathVariable Long ticketId) {
        ticketAlertService.sendTicketAlert(ticketId);
    }

    @GetMapping("/role/{role}")
    public List<TicketAlertResponse> getAlerts(@PathVariable String role) {
        return ticketAlertService.getAlertsForRole(role);
    }

    @PutMapping("/resolve/{alertId}")
    public void resolve(@PathVariable Long alertId) {
        ticketAlertService.resolveAlert(alertId);
    }
    @PutMapping("/resolve-by-ticket/{ticketId}")
public void resolveByTicket(@PathVariable Long ticketId) {
    ticketAlertService.resolveAlertsByTicketId(ticketId);
}
}