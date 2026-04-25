package com.Authentication.BACKEND.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

     private final JavaMailSender mailSender;

      @Value("${spring.mail.properties.mail.smtp.from}")
      private String fromEmail;

       // Welcome Email remains plain text
    public void sendWelcomeEmail(String toEmail, String name) {
        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to CampusOps Hub, " + name + "!");

            String body = "<p>Dear " + name + ",</p>"
                    + "<p>Welcome to CampusOps Hub!</p>"
                    + "<p>We’re excited to have you onboard. CampusOps Hub is designed to simplify and streamline campus operations, making it easier for you to manage facility bookings, report incidents, and stay updated with maintenance activities—all in one place.</p>"
                    + "<p>With CampusOps Hub, you can:</p>"
                    + "<ul>"
                    + "<li>Book rooms, labs, and equipment</li>"
                    + "<li>Report issues and track their progress</li>"
                    + "<li>Receive real-time updates from technicians</li>"
                    + "<li>Manage your tasks efficiently through a centralized system</li>"
                    + "</ul>"
                    + "<p>Our goal is to provide you with a smooth, transparent, and reliable experience. If you have any questions or need assistance, feel free to reach out to our support team at any time.</p>"
                    + "<p>Thank you for choosing CampusOps Hub!</p>"
                    + "<p>Best regards,<br>CampusOps Hub Team</p>";

            helper.setText(body, true); // HTML enabled
            mailSender.send(message);

        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }





}