package com.infonest.repository;

import com.infonest.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    // Kisi user ki history dekhne ke liye
    List<Registration> findByUserId(Long userId);

    // Duplicate registration check karne ke liye
    Optional<Registration> findByUserIdAndEventId(Long userId, Long eventId);

    long countByEventId(Long eventId);

    // Faculty ko event ke applicants dikhane ke liye
    List<Registration> findByEventId(Long eventId);

    @Query("SELECT r FROM Registration r WHERE r.eventId IN (SELECT e.eventId FROM Event e WHERE e.clubId = :clubId)")
    List<Registration> findAllByClubId(@Param("clubId") String clubId);

}
