package com.infonest.repository;

import com.infonest.model.Schedules;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.Optional;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedules, Long> {

    // 1. Existing: Find where teacher is right now
    @Query("SELECT s FROM Schedules s WHERE s.teacherName ILIKE %:name% " +
       "AND s.dayOfWeek = :day AND :currentTime BETWEEN s.startTime AND s.endTime")
Optional<Schedules> findCurrentLocation(@Param("name") String name, @Param("day") String day, @Param("currentTime") LocalTime currentTime);

    // Use ILIKE and DISTINCT to prevent "Non-Unique Result" errors which cause 500 errors
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