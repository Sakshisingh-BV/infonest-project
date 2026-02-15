package com.infonest.config;

import com.infonest.model.VenueBooking;
import com.infonest.repository.VenueBookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
public class BookingCleanupScheduler {

    @Autowired
    private VenueBookingRepository venueBookingRepository;

    // Runs every 5 minutes — deletes bookings whose time has passed
    @Scheduled(fixedRate = 300000)
    public void cleanupExpiredBookings() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        List<VenueBooking> allBookings = venueBookingRepository.findAll();

        for (VenueBooking booking : allBookings) {
            if ("CONFIRMED".equals(booking.getStatus())) {
                // Delete if: date is past, OR date is today and endTime has passed
                if (booking.getBookingDate().isBefore(today) ||
                        (booking.getBookingDate().isEqual(today) && booking.getEndTime().isBefore(now))) {
                    venueBookingRepository.delete(booking);
                }
            }
        }
    }
}
