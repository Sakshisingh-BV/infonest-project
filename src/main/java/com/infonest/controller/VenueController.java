package com.infonest.controller;

import com.infonest.config.JwtUtils;
import com.infonest.model.Venue;
import com.infonest.model.VenueBooking;
import com.infonest.model.User;
import com.infonest.repository.VenueRepository;
import com.infonest.repository.VenueBookingRepository;
import com.infonest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/venues")
public class VenueController {

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private VenueBookingRepository venueBookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    // ==================== Helper ====================
    private String getEmailFromToken(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtUtils.extractEmail(token);
    }

    private String getRoleFromToken(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtUtils.extractRole(token);
    }

    // ==================== VENUE CRUD (Admin Only) ====================

    // 1. GET ALL VENUES (public — for showing available venues)
    @GetMapping("/all")
    public ResponseEntity<List<Venue>> getAllActiveVenues() {
        return ResponseEntity.ok(venueRepository.findByIsActiveTrue());
    }

    // 2. ADD VENUE (Admin only)
    @PostMapping("/add")
    public ResponseEntity<?> addVenue(@RequestBody Venue venue,
            @RequestHeader("Authorization") String authHeader) {
        String role = getRoleFromToken(authHeader);
        if (!"OFFICE".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only OFFICE can add venues");
        }

        if (venue.getIsActive() == null)
            venue.setIsActive(true);
        venueRepository.save(venue);
        return ResponseEntity
                .ok(Map.of("message", "Venue '" + venue.getName() + "' added successfully!", "venue", venue));
    }

    // 3. UPDATE VENUE (Admin only)
    @PutMapping("/{venueId}")
    public ResponseEntity<?> updateVenue(@PathVariable Long venueId,
            @RequestBody Venue venueDetails,
            @RequestHeader("Authorization") String authHeader) {
        String role = getRoleFromToken(authHeader);
        if (!"OFFICE".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only OFFICE can update venues");
        }

        Venue venue = venueRepository.findById(venueId).orElse(null);
        if (venue == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Venue not found");
        }

        venue.setName(venueDetails.getName());
        venue.setType(venueDetails.getType());
        venue.setCapacity(venueDetails.getCapacity());
        venue.setLocation(venueDetails.getLocation());
        venue.setIsActive(venueDetails.getIsActive());
        venueRepository.save(venue);

        return ResponseEntity.ok(Map.of("message", "Venue updated successfully!", "venue", venue));
    }

    // 4. DELETE VENUE (Admin only — soft delete)
    @DeleteMapping("/{venueId}")
    public ResponseEntity<?> deleteVenue(@PathVariable Long venueId,
            @RequestHeader("Authorization") String authHeader) {
        String role = getRoleFromToken(authHeader);
        if (!"OFFICE".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only OFFICE can delete venues");
        }

        Venue venue = venueRepository.findById(venueId).orElse(null);
        if (venue == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Venue not found");
        }

        venue.setIsActive(false);
        venueRepository.save(venue);
        return ResponseEntity.ok("Venue deactivated successfully!");
    }

    // ==================== SEARCH AVAILABLE VENUES ====================

    // 5. SEARCH AVAILABLE VENUES for a given date + time slot
    @GetMapping("/available")
    public ResponseEntity<?> getAvailableVenues(
            @RequestParam LocalDate date,
            @RequestParam LocalTime startTime,
            @RequestParam LocalTime endTime,
            @RequestParam(required = false) Integer capacity,
            @RequestParam(required = false) String type,
            @RequestHeader("Authorization") String authHeader) {

        // Role check — only non-STUDENT
        String role = getRoleFromToken(authHeader);
        if ("STUDENT".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Students cannot book venues");
        }

        // Validate time range
        if (!endTime.isAfter(startTime)) {
            return ResponseEntity.badRequest().body("End time must be after start time");
        }

        // Get all active venues (optionally filter by type and capacity)
        List<Venue> allVenues;
        if (type != null && !type.isEmpty() && capacity != null) {
            allVenues = venueRepository.findByTypeAndCapacityGreaterThanEqualAndIsActiveTrue(type, capacity);
        } else if (type != null && !type.isEmpty()) {
            allVenues = venueRepository.findByTypeAndIsActiveTrue(type);
        } else if (capacity != null) {
            allVenues = venueRepository.findByCapacityGreaterThanEqualAndIsActiveTrue(capacity);
        } else {
            allVenues = venueRepository.findByIsActiveTrue();
        }

        // Filter out venues that have conflicting bookings
        List<Venue> availableVenues = allVenues.stream()
                .filter(venue -> {
                    List<VenueBooking> conflicts = venueBookingRepository.findConflictingBookings(
                            venue.getVenueId(), date, startTime, endTime);
                    return conflicts.isEmpty(); // Available only if no conflicts
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(availableVenues);
    }

    // ==================== BOOKING OPERATIONS ====================

    // 6. CREATE BOOKING
    @PostMapping("/book")
    public ResponseEntity<?> bookVenue(@RequestBody Map<String, Object> bookingRequest,
            @RequestHeader("Authorization") String authHeader) {
        String email = getEmailFromToken(authHeader);
        String role = getRoleFromToken(authHeader);

        // Role check
        if ("STUDENT".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Students cannot book venues");
        }

        try {
            Long venueId = Long.parseLong(bookingRequest.get("venueId").toString());
            LocalDate bookingDate = LocalDate.parse(bookingRequest.get("bookingDate").toString());
            LocalTime startTime = LocalTime.parse(bookingRequest.get("startTime").toString());
            LocalTime endTime = LocalTime.parse(bookingRequest.get("endTime").toString());
            String purpose = bookingRequest.get("purpose").toString();
            String bookingType = bookingRequest.get("bookingType").toString();
            String eventName = bookingRequest.get("eventName") != null
                    ? bookingRequest.get("eventName").toString()
                    : null;

            // Validate time
            if (!endTime.isAfter(startTime)) {
                return ResponseEntity.badRequest().body("End time must be after start time");
            }

            // Check venue exists
            Venue venue = venueRepository.findById(venueId).orElse(null);
            if (venue == null || !venue.getIsActive()) {
                return ResponseEntity.badRequest().body("Venue not found or is inactive");
            }

            // Check for conflicts
            List<VenueBooking> conflicts = venueBookingRepository.findConflictingBookings(
                    venueId, bookingDate, startTime, endTime);
            if (!conflicts.isEmpty()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("This venue is already booked for the selected time slot!");
            }

            // Get user name
            User user = userRepository.findByEmail(email).orElse(null);
            String bookedByName = user != null
                    ? user.getFirstName() + " " + user.getLastName()
                    : email;

            // Create booking
            VenueBooking booking = new VenueBooking();
            booking.setBookedByEmail(email);
            booking.setBookedByName(bookedByName);
            booking.setVenue(venue);
            booking.setBookingDate(bookingDate);
            booking.setStartTime(startTime);
            booking.setEndTime(endTime);
            booking.setPurpose(purpose);
            booking.setBookingType(bookingType);
            booking.setEventName(eventName);
            booking.setStatus("CONFIRMED");
            booking.setCreatedAt(LocalDateTime.now());

            venueBookingRepository.save(booking);

            return ResponseEntity.ok(Map.of(
                    "message", "✅ " + venue.getName() + " booked successfully!",
                    "booking", booking));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid booking data: " + e.getMessage());
        }
    }

    // 7. GET MY BOOKINGS (filters out expired ones)
    @GetMapping("/my-bookings")
    public ResponseEntity<?> getMyBookings(@RequestHeader("Authorization") String authHeader) {
        String email = getEmailFromToken(authHeader);
        List<VenueBooking> bookings = venueBookingRepository.findByBookedByEmailOrderByCreatedAtDesc(email);

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        // Filter out expired and cancelled bookings
        List<VenueBooking> activeBookings = bookings.stream()
                .filter(b -> {
                    // Skip cancelled bookings
                    if ("CANCELLED".equals(b.getStatus()))
                        return false;
                    if (b.getBookingDate().isAfter(today))
                        return true;
                    if (b.getBookingDate().isEqual(today) && b.getEndTime().isAfter(now))
                        return true;
                    return false;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(activeBookings);
    }

    // 8. CANCEL BOOKING
    @PutMapping("/cancel/{bookingId}")
    public ResponseEntity<?> cancelBooking(@PathVariable Long bookingId,
            @RequestHeader("Authorization") String authHeader) {
        String email = getEmailFromToken(authHeader);
        String role = getRoleFromToken(authHeader);

        VenueBooking booking = venueBookingRepository.findById(bookingId).orElse(null);
        if (booking == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Booking not found");
        }

        // Only the person who booked or ADMIN can cancel
        if (!booking.getBookedByEmail().equals(email) && !"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only cancel your own bookings");
        }

        venueBookingRepository.delete(booking);
        return ResponseEntity.ok("Booking cancelled and removed successfully!");
    }

    // 9. GET VENUE COUNT (for stats)
    @GetMapping("/count")
    public ResponseEntity<?> getVenueCount() {
        long count = venueRepository.findByIsActiveTrue().size();
        return ResponseEntity.ok(Map.of("totalVenues", count));
    }
}
