package com.infonest.model;

import jakarta.persistence.*; // Correct for Spring Boot 3+
import lombok.Data;
import java.time.LocalTime;

@Entity // <--- THIS IS WHAT HIBERNATE IS LOOKING FOR
@Table(name = "schedules")
@Data
public class Schedules {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String teacherName;
    private String subject;
    private String roomNo;
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private String documentUrl;
}