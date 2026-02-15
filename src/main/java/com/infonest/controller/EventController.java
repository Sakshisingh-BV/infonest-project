package com.infonest.controller;

import com.infonest.model.Event;
import com.infonest.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/events")
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    // 1. PUBLIC: Sabhi users (Guest/Student/Admin) events dekh sakte hain
    @GetMapping
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    // 2. PUBLIC: Kisi specific event ki details dekhne ke liye
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        return eventRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. FACULTY: Apne club ke liye naya event add karna
    @PostMapping("/add")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        Event savedEvent = eventRepository.save(event);
        return ResponseEntity.ok(savedEvent);
    }

    // 4. FACULTY/ADMIN: Event update karna
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody Event eventDetails) {
        return eventRepository.findById(id).map(existingEvent -> {
            existingEvent.setEventName(eventDetails.getEventName());
            existingEvent.setDescription(eventDetails.getDescription());
            existingEvent.setVenueId(eventDetails.getVenueId());
            existingEvent.setEventDate(eventDetails.getEventDate());
            existingEvent.setEventTime(eventDetails.getEventTime());
            existingEvent.setDeadline(eventDetails.getDeadline());
            existingEvent.setRegistrationFormLink(eventDetails.getRegistrationFormLink());
            return ResponseEntity.ok(eventRepository.save(existingEvent));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Event>> getUpcomingEvents() {
        // Return visible events with eventDate >= today, sorted by date ascending
        // (nearest first)
        return ResponseEntity
                .ok(eventRepository.findByHiddenFalseAndEventDateGreaterThanEqualOrderByEventDateAsc(LocalDate.now()));
    }

    // 6. PUBLIC: Get ALL events by clubId (sorted by date, for individual club
    // page)
    @GetMapping("/club/{clubId}")
    public ResponseEntity<List<Event>> getEventsByClubId(@PathVariable String clubId) {
        // Return all visible events for this club, sorted by date ascending
        return ResponseEntity.ok(eventRepository.findByClubIdAndHiddenFalseOrderByEventDateAsc(clubId));
    }

    // 5. FACULTY/ADMIN: Event delete karna
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<String> deleteEvent(@PathVariable Long id) {
        eventRepository.deleteById(id);
        return ResponseEntity.ok("Event deleted successfully");
    }
}