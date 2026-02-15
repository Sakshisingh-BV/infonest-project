package com.infonest.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "venue_bookings")
public class VenueBooking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;

    // Who booked
    @Column(nullable = false)
    private String bookedByEmail;

    private String bookedByName;

    // Which venue
    @ManyToOne
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    // When
    @Column(nullable = false)
    private LocalDate bookingDate;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    // What for
    @Column(nullable = false)
    private String purpose; // CLASS, WORKSHOP, COMPETITION, MEETING, HACKATHON, SEMINAR, CONFERENCE, EVENT

    private String eventName; // Optional — for event bookings

    @Column(nullable = false)
    private String bookingType; // CLASSROOM or EVENT

    // Status
    @Column(nullable = false)
    private String status = "CONFIRMED"; // CONFIRMED, CANCELLED

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
