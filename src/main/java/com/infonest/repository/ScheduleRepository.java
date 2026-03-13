package com.infonest.repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import com.infonest.model.Schedules;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.Optional;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedules, Long> {

    // 1. Existing: Find where teacher is right now
    @Query("SELECT s FROM Schedules s WHERE s.teacherName ILIKE %:name% " +
       "AND s.dayOfWeek = :day " +
       "AND :time BETWEEN s.startTime AND s.endTime")
Optional<Schedules> findCurrentLocation(@Param("name") String name, 
                                        @Param("day") String day, 
                                        @Param("time") LocalTime time);

// Also add this to help find the sitting cabin regardless of the day
@Query("SELECT DISTINCT s.sittingCabin FROM Schedules s WHERE s.email = :email")
List<String> findCabinByEmail(@Param("email") String email);

    // Inside ScheduleRepository.java

   // src/main/java/com/infonest/repository/ScheduleRepository.java

// Replace the email-specific section with this:
List<Schedules> findByEmail(String email);

@Modifying
@Transactional
@Query("DELETE FROM Schedules s WHERE TRIM(LOWER(s.email)) = TRIM(LOWER(:email))")
void deleteByEmail(@Param("email") String email);

@Query("SELECT DISTINCT s.sittingCabin FROM Schedules s WHERE s.teacherName ILIKE %:name%")
Optional<String> findSittingCabin(@Param("name") String name);

// Fix the advanced search query logic
@Query("SELECT s FROM Schedules s WHERE s.teacherName ILIKE %:name% " +
       "AND UPPER(s.dayOfWeek) = UPPER(:day) " +
       "AND :time BETWEEN s.startTime AND s.endTime")
Optional<Schedules> findSpecificSlot(
    @Param("name") String name, 
    @Param("day") String day, 
    @Param("time") java.time.LocalTime time
);
}
// Role validation ke liye zaroori hai