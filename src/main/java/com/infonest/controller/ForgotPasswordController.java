package com.infonest.controller;

import com.infonest.model.User;
import com.infonest.repository.UserRepository;
import com.infonest.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173") // React port ko allow karne ke liye
@RestController
@RequestMapping("/api/auth")
public class ForgotPasswordController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // 1. Email par Reset Link bhejne ke liye
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found!");
        }

        User user = userOptional.get();
        
        // Token generate aur save karna
        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setTokenExpiryDate(LocalDateTime.now().plusMinutes(15)); // 15 min expiry
        userRepository.save(user);

        // Reset link taiyaar karna
        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        
        // Email bhejna
        emailService.sendEmail(user.getEmail(), "Password Reset Link", 
            "Click the link below to reset your password:\n" + resetLink);

        return ResponseEntity.ok("Reset link sent successfully to your email.");
    }

    // 2. Token verify karke naya password set karne ke liye
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        System.out.println("Token Received"+token);
        if (token == null || newPassword == null) {
            return ResponseEntity.badRequest().body("Token or Password missing!");
        }

        Optional<User> userOptional = userRepository.findByResetPasswordToken(token);

        if (userOptional.isEmpty() || userOptional.get().getTokenExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Invalid or expired token!");
        }

        User user = userOptional.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setTokenExpiryDate(null);
        userRepository.save(user);

        return ResponseEntity.ok("Password updated successfully.");
    }
}