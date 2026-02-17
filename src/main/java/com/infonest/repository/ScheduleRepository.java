package com.infonest.repository;

import com.infonest.model.Schedules;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalTime;
import java.util.Optional;

public interface ScheduleRepository extends JpaRepository<Schedules, Long> {

    @Query("SELECT s FROM Schedules s WHERE s.teacherName = :name " +
           "AND s.dayOfWeek = :day " +
           "AND :currentTime BETWEEN s.startTime AND s.endTime")
    Optional<Schedules> findCurrentLocation(
        @Param("name") String name, 
        @Param("day") String day, 
        @Param("currentTime") LocalTime currentTime
    );
}