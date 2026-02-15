package com.infonest.controller;

import com.infonest.model.Registration;
import com.infonest.repository.RegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/student")
public class StudentController {

    @Autowired
    private RegistrationRepository registrationRepository;

    // API: Event mein register karne ke liye (Updated to allow all roles)
    @PostMapping("/register")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<Object> registerForEvent(@RequestBody Registration registration) {
        // CHECK: User ne iss event mein pehle se register kiya hai ya nahi
        Optional<Registration> existingRegistration = registrationRepository
                .findByUserIdAndEventId(registration.getUserId(), registration.getEventId());

        if (existingRegistration.isPresent()) {
            // Already registered - return error
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "You have already registered for this event!"));
        }

        registration.setStatus("APPLIED"); // Default status
        registration.setSubmissionDate(LocalDateTime.now()); // Set current time

        registration.setFormData(null); // Shuruat mein null

        // Row save hone ke baad hume pura object (with regId) wapas bhejna hai
        Registration saved = registrationRepository.save(registration);

        // String ki jagah 'saved' object bhej rahe hain taaki frontend ko regId mil
        // sake
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/update-form-data")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<String> updateFormData(@RequestBody Map<String, Object> payload) {
        Long regId = Long.valueOf(payload.get("regId").toString());
        String jsonData = payload.get("formData").toString();

        Registration existingReg = registrationRepository.findById(regId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        existingReg.setFormData(jsonData);
        existingReg.setSubmissionDate(LocalDateTime.now()); // Update submission date when form is actually submitted
        registrationRepository.save(existingReg);

        return ResponseEntity.ok("Form data submitted successfully!");
    }

    // API: User ko uske apne saare applied events dikhane ke liye (Updated to use
    // userId)
    @GetMapping("/my-registrations/{userId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public List<Registration> getMyRegistrations(@PathVariable Long userId) {
        // Updated method name in repository to match your 'user_id' column
        return registrationRepository.findByUserId(userId);
    }
}