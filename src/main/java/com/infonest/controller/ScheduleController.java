package com.infonest.controller;

import com.infonest.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/office/schedule")
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadExcel(@RequestParam("file") MultipartFile file) {
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
            scheduleService.importExcel(file);
            return ResponseEntity.ok(Map.of("message", "Schedule imported successfully!"));
        } catch (Exception e) {
            // This returns the specific row error message we wrote in the Service
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Map.of("message", e.getMessage()));
        }
    }
}