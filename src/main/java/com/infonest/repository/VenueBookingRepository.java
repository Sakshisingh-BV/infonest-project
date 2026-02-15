package com.infonest.repository;

import com.infonest.model.VenueBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface VenueBookingRepository extends JpaRepository<VenueBooking, Long> {

    // Find all bookings for a specific venue on a specific date (only confirmed)
    List<VenueBooking> findByVenue_VenueIdAndBookingDateAndStatus(Long venueId, LocalDate date, String status);

    // Find conflicting bookings — venues booked at overlapping time slots
    @Query("SELECT vb FROM VenueBooking vb WHERE vb.venue.venueId = :venueId " +
            "AND vb.bookingDate = :date " +
            "AND vb.status = 'CONFIRMED' " +
            "AND vb.startTime < :endTime " +
            "AND vb.endTime > :startTime")
    List<VenueBooking> findConflictingBookings(
            @Param("venueId") Long venueId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    // Find all bookings by a user
    List<VenueBooking> findByBookedByEmailOrderByCreatedAtDesc(String email);

    // Find all bookings for a date
    List<VenueBooking> findByBookingDateAndStatus(LocalDate date, String status);
}
