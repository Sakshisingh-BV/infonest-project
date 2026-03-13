package com.infonest.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalTime;

@Entity
@Table(name = "schedules")
@Data
public class Schedules {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String teacherName;
    private String subject;
    private String batchName;
    private String roomNo;
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private String documentUrl;
    private String sittingCabin; // Added for the new requirement
    // Schedules.java mein add karein
    private String email;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}