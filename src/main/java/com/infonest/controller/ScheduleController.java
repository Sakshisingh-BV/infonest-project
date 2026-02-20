package com.infonest.controller;

import com.infonest.repository.ScheduleRepository;
import com.infonest.repository.UserRepository;
import com.infonest.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.infonest.model.User; // User model ko recognize karne ke liye
import java.util.List;          // List interface ke liye
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
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
        @RequestParam(value = "isUpdate", defaultValue = "false") boolean isUpdate // Frontend se flag lega
    ) {
        // 1. Check if file is empty
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please select a file to upload."));
        }

        // 2. Validate file type (Professional check)
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") 
            && !contentType.equals("application/vnd.ms-excel"))) {
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                                .body(Map.of("message", "Invalid file type. Please upload an Excel file."));
        }

        try {
            // Updated Service call with isUpdate flag
            scheduleService.importExcel(file, isUpdate);
            
            String successMsg = isUpdate ? "Schedule updated and replaced successfully!" : "Schedule added successfully!";
            return ResponseEntity.ok(Map.of("message", successMsg));
        } catch (Exception e) {
            // Service se aane wala specific error message (like Row error or Role violation)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(Map.of("message", e.getMessage()));
        }
    }

        // 1. Search for teachers to manage
    @GetMapping("/teachers/search")
    public ResponseEntity<?> searchTeachers(@RequestParam String query) {
        List<User> teachers = userRepository.searchManageableTeachers(query);
        if (teachers.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No such user found.");
        }
        return ResponseEntity.ok(teachers);
    }

    // 2. Delete all schedules for a specific teacher name
    @DeleteMapping("/delete-teacher-schedule")
    public ResponseEntity<?> deleteTeacherSchedule(@RequestParam String teacherName) {
        try {
            repository.deleteByTeacherName(teacherName); // You'll add this to ScheduleRepository
            return ResponseEntity.ok(Map.of("message", "Schedule for " + teacherName + " deleted successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting schedule.");
        }
    }
}