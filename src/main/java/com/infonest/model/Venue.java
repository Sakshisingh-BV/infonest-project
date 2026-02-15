package com.infonest.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "venues")
public class Venue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long venueId;

    @Column(nullable = false)
    private String name; // e.g., "Room 101", "Main Auditorium"

    @Column(nullable = false)
    private String type; // CLASSROOM, AUDITORIUM, SEMINAR_HALL, COMPUTER_LAB, CONFERENCE_ROOM, OUTDOOR

    @Column(nullable = false)
    private Integer capacity; // Max seating capacity

    private String location; // e.g., "Block A, Floor 2"

    @Column(nullable = false)
    private Boolean isActive = true; // Soft delete / disable venue
}
