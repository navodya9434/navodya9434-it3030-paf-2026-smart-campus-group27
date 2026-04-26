package com.Authentication.BACKEND.Service.Ticket;

import com.Authentication.BACKEND.Entity.Ticket.TicketAlertEntity;
import com.Authentication.BACKEND.Entity.Ticket.TicketEntity;
import com.Authentication.BACKEND.Repository.Ticket.TicketAlertRepository;
import com.Authentication.BACKEND.Repository.Ticket.TicketRepository;
import com.Authentication.BACKEND.Io.Ticket.TicketAlertResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
// 🔥 This service is responsible for creating and managing alerts related to tickets.
@Service
@RequiredArgsConstructor
public class TicketAlertServiceImpl implements TicketAlertService {

    private final TicketRepository ticketRepository;
    private final TicketAlertRepository alertRepository;

    @Override
public void sendTicketAlert(Long ticketId) {

    TicketEntity ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));

    String location = ticket.getLocation(); // 🔥 ensure this is always used
    String message = "New issue reported at " + location;

    // Booking Manager Alert
    TicketAlertEntity bookingAlert = TicketAlertEntity.builder()
            .message(message)
            .location(location)
            .targetRole("BOOKING_MANAGER")
            .ticket(ticket)
            .build();

    // Facility Manager Alert
    TicketAlertEntity facilityAlert = TicketAlertEntity.builder()
            .message(message)
            .location(location)
            .targetRole("FACILITY_MANAGER")
            .ticket(ticket)
            .build();

    alertRepository.save(bookingAlert);
    alertRepository.save(facilityAlert);

    System.out.println("✅ Alerts created for location: " + location);
}

@Override
public void resolveAlertsByTicketId(Long ticketId) {

    List<TicketAlertEntity> alerts =
            alertRepository.findByTicketId(ticketId);

    for (TicketAlertEntity alert : alerts) {
        alert.setStatus("RESOLVED");
        alert.setResolvedAt(LocalDateTime.now());
    }

    alertRepository.saveAll(alerts);

    System.out.println("✅ All alerts resolved for ticket: " + ticketId);
}
    @Override
    public List<TicketAlertResponse> getAlertsForRole(String role) {
        return alertRepository.findByTargetRoleAndStatus(role, "ACTIVE")
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    @Override
    public void resolveAlert(Long alertId) {

        TicketAlertEntity alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        alert.setStatus("RESOLVED");
        alert.setResolvedAt(LocalDateTime.now());

        alertRepository.save(alert);

        System.out.println("✅ Alert resolved: " + alertId);
    }

    private TicketAlertResponse map(TicketAlertEntity a) {
        return TicketAlertResponse.builder()
                .id(a.getId())
                .ticketId(a.getTicket().getId())
                .message(a.getMessage())
                .location(a.getLocation())
                .status(a.getStatus())
                .targetRole(a.getTargetRole())
                .createdAt(a.getCreatedAt())
                .resolvedAt(a.getResolvedAt())
                .build();
    }
}