package com.infonest.controller;

import com.infonest.model.User;
import com.infonest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // 1. Logged-in user ki profile details lane ke liye
    @GetMapping("/profile/{email}")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<User> getUserProfile(@PathVariable String email) {
        return userRepository.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 2. Role check karne ke liye (Frontend security ke liye useful hai)
    @GetMapping("/check-role")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> getMyRole(@RequestParam String email) {
        Optional<User> user = userRepository.findByEmail(email);
        return user.map(value -> ResponseEntity.ok(value.getRole()))
                   .orElseGet(() -> ResponseEntity.badRequest().body("User not found"));
    }
}