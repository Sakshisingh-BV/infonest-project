package com.infonest.repository;

import com.infonest.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    // Original methods
    List<Event> findByEventDateAfterOrderByEventDateAsc(LocalDate date);

    List<Event> findByClubId(String clubId);

    java.util.Optional<Event> findByClubIdAndEventName(String clubId, String eventName);

    // Public view methods (exclude hidden events)
    List<Event> findByHiddenFalseAndEventDateAfterOrderByEventDateAsc(LocalDate date);

    List<Event> findByClubIdAndHiddenFalse(String clubId);

    // All events for a club sorted by date (newest first for display)
    List<Event> findByClubIdAndHiddenFalseOrderByEventDateAsc(String clubId);

    // Upcoming events including today
    List<Event> findByHiddenFalseAndEventDateGreaterThanEqualOrderByEventDateAsc(LocalDate date);
}
