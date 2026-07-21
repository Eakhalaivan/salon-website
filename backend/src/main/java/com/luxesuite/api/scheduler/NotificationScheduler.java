package com.luxesuite.api.scheduler;

import com.luxesuite.api.model.Appointment;
import com.luxesuite.api.model.AppointmentStatus;
import com.luxesuite.api.repository.AppointmentRepository;
import com.luxesuite.api.service.NotificationService;
import com.luxesuite.api.service.whatsapp.WhatsAppService;
import com.luxesuite.api.repository.WhatsAppMessageLogRepository;
import com.luxesuite.api.model.WhatsAppMessageLog;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.CompletableFuture;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private static final Logger log = LoggerFactory.getLogger(NotificationScheduler.class);

    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;
    private final WhatsAppService whatsAppService;
    private final WhatsAppMessageLogRepository whatsappLogRepository;

    // Run every hour
    @Scheduled(fixedRate = 3600000)
    public void sendAppointmentReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrow = now.plusDays(1);
        
        log.info("Running Appointment Reminder Job at {}", now);
        
        List<Appointment> upcoming = appointmentRepository.findUpcomingForReminder(now, tomorrow);
        for (Appointment apt : upcoming) {
            String email = apt.getCustomer() != null && apt.getCustomer().getUser() != null ? apt.getCustomer().getUser().getEmail() : null;
            String phone = apt.getCustomer() != null ? apt.getCustomer().getPhone() : null;
            
            String startTime = apt.getServices() != null && !apt.getServices().isEmpty() ? apt.getServices().get(0).getStartTime().toString() : "TBD";
            if (email != null) {
                notificationService.sendEmail(email, "Appointment Reminder", "You have an appointment coming up at " + startTime);
            }
            if (phone != null) {
                notificationService.sendSms(phone, "Reminder: Your LuxeSuite appointment is at " + startTime);
                
                // WhatsApp integration
                if (Boolean.TRUE.equals(apt.getCustomer().getWhatsappOptIn())) {
                    Map<String, String> params = new HashMap<>();
                    params.put("time", startTime);
                    params.put("customerName", apt.getCustomer().getFirstName());
                    
                    CompletableFuture.runAsync(() -> {
                        try {
                            String status = whatsAppService.sendMessage(phone, "appointment_reminder", params);
                            WhatsAppMessageLog logEntry = WhatsAppMessageLog.builder()
                                .customer(apt.getCustomer())
                                .phoneNumber(phone)
                                .templateName("appointment_reminder")
                                .status(status)
                                .relatedEntityType("Appointment")
                                .relatedEntityId(apt.getId())
                                .build();
                            whatsappLogRepository.save(logEntry);
                        } catch (Exception e) {
                            log.error("Failed to send WhatsApp message to {}", phone, e);
                            WhatsAppMessageLog logEntry = WhatsAppMessageLog.builder()
                                .customer(apt.getCustomer())
                                .phoneNumber(phone)
                                .templateName("appointment_reminder")
                                .status("FAILED")
                                .relatedEntityType("Appointment")
                                .relatedEntityId(apt.getId())
                                .build();
                            whatsappLogRepository.save(logEntry);
                        }
                    });
                }
            }
            
            apt.setReminderSentAt(now);
            appointmentRepository.save(apt);
        }
    }
}
