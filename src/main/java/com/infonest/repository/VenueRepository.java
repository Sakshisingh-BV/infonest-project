package com.infonest.repository;

import com.infonest.model.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {

    // Get all active venues
    List<Venue> findByIsActiveTrue();

    // Get active venues by type
    List<Venue> findByTypeAndIsActiveTrue(String type);

    // Get active venues with capacity >= required
    List<Venue> findByCapacityGreaterThanEqualAndIsActiveTrue(Integer capacity);

    // Get active venues by type with capacity >= required
    List<Venue> findByTypeAndCapacityGreaterThanEqualAndIsActiveTrue(String type, Integer capacity);
}
