package com.infonest.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Data
@Table(name = "events")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long eventId;

    private String clubId;
    private String venueId;
    private String eventName;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate eventDate;
    private LocalTime eventTime;
    private LocalDate deadline;

    // Isme URL ya "club_form_link" store hoga
    private String registrationFormLink;

    // Admin can hide events from public view
    @Column(nullable = false)
    private Boolean hidden = false;
}