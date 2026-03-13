package com.infonest.controller;

import com.infonest.repository.ScheduleRepository;
import com.infonest.repository.UserRepository;
import com.infonest.service.ScheduleService;
import com.infonest.model.Schedules;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.infonest.model.User; // User model ko recognize karne ke liye

import java.util.ArrayList;
import java.util.List;          // List interface ke liye
// import java.time.DayOfWeek;
// import java.time.LocalDate;
// import java.time.LocalTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/office/schedule")
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    @Autowired
    private ScheduleRepository repository; // This solves the "cannot be resolved" error

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/search/now")
    public ResponseEntity<String> searchNow(@RequestParam String name) {
        Object result = scheduleService.getRealTimeStatus(name);
        return ResponseEntity.ok(result.toString());
    }

    @GetMapping("/cabin")
    public ResponseEntity<String> searchCabin(@RequestParam String name) {
        return ResponseEntity.ok(scheduleService.getTeacherCabin(name));
    }

    @GetMapping("/search/advanced")
    public ResponseEntity<?> searchAdvanced(@RequestParam String name, @RequestParam String day, @RequestParam String time) {
        try {
            java.time.LocalTime parsedTime = java.time.LocalTime.parse(time);
            
            return repository.findSpecificSlot(name, day, parsedTime)
                    .map(schedule -> ResponseEntity.ok(schedule)) // Returns JSON object
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid time format (HH:mm:ss required)");
        }
    }
   @PostMapping("/upload")
public ResponseEntity<?> uploadExcel(
    @RequestParam("file") MultipartFile file,
    @RequestParam("email") String email,
    @RequestParam("teacherName") String teacherName,
    @RequestParam(value = "isUpdate", defaultValue = "false") boolean isUpdate 
) {
    if (file.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "File empty"));

    try {
        scheduleService.importExcel(file, email, teacherName, isUpdate);
        return ResponseEntity.ok(Map.of("message", isUpdate ? "Updated!" : "Added!"));
    } catch (IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
    }
}

    // 2. Check Endpoint (Make sure @RequestParam is exactly "email")
    @GetMapping("/teachers/check-schedule")
    public ResponseEntity<?> checkScheduleExists(@RequestParam("email") String email) {
        try {
            List<Schedules> schedules = repository.findByEmail(email);
            return ResponseEntity.ok(Map.of("hasSchedule", !schedules.isEmpty()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("hasSchedule", false));
        }
    }
    
    // Modal mein data dikhane ke liye naya endpoint (FIXED)
    @GetMapping("/teachers/schedule-data")
    public ResponseEntity<?> getTeacherScheduleData(@RequestParam("email") String email) {
        // Now it properly searches by EMAIL, not by Name
        return ResponseEntity.ok(repository.findByEmail(email)); 
    }

     // 1. Search for teachers to manage
// Yahan humne response entity ka type <?> kar diya hai taaki hum custom Map bhej sakein
    @GetMapping("/teachers/search")
    public ResponseEntity<?> searchTeachers(@RequestParam("query") String query) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.ok(new ArrayList<>());
        }
        
        // Database se data laya
        List<User> teachers = userRepository.searchManageableTeachers(query.trim());
        
        // 500 ERROR FIX: JSON Infinite Recursion rokne ke liye custom map banaya
        List<java.util.Map<String, Object>> safeResponse = new ArrayList<>();
        
        for (User t : teachers) {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            // DHYAN DEIN: Agar aapke User model mein getUserId() hai toh usko use karein
            map.put("userId", t.getUserId()); 
            map.put("firstName", t.getFirstName());
            map.put("lastName", t.getLastName());
            map.put("email", t.getEmail());
            
            safeResponse.add(map);
        }
        
        return ResponseEntity.ok(safeResponse);
    }

    // 2. Check if a teacher has a schedule
    // @GetMapping("/teachers/check-schedule/{teacherName}")
    // public ResponseEntity<?> checkScheduleExists(@PathVariable String teacherName) {
    //     try {
    //         List<Schedules> schedules = repository.findByTeacherNameIgnoreCase(teacherName);
    //         boolean hasSchedule = !schedules.isEmpty();
    //         return ResponseEntity.ok(Map.of(
    //                 "hasSchedule", hasSchedule,
    //                 "scheduleCount", schedules.size()
    //         ));
    //     } catch (Exception e) {
    //         return ResponseEntity.badRequest().body(Map.of("hasSchedule", false));
    //     }
    // }

    // 3. Delete all schedules for a specific teacher name
    // src/main/java/com/infonest/controller/ScheduleController.java

    // 1. Delete Endpoint (Make sure @RequestParam is exactly "email")
    @DeleteMapping("/delete-teacher-schedule")
    public ResponseEntity<?> deleteSchedule(@RequestParam("email") String email) {
        try {
            scheduleService.deleteTeacherSchedule(email);
            return ResponseEntity.ok(Map.of("message", "Schedule deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Map.of("message", "Failed to delete: " + e.getMessage()));
        }
    }
}