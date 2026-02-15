package com.infonest.service;

import com.infonest.model.User;
import com.infonest.repository.UserRepository;
import com.infonest.repository.ClubRepository;
import com.infonest.dto.*;
import com.infonest.config.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    // Allowed email domains
    private static final String[] ALLOWED_DOMAINS = { "@banasthali.in", "@gmail.com" };

    // Password patterns
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile("[A-Z]");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile("[!@#$%^&*(),.?\":{}|<>_\\-+=\\[\\]\\\\;'/`~]");

    /**
     * Validate email domain
     */
    private boolean isValidEmailDomain(String email) {
        if (email == null)
            return false;
        for (String domain : ALLOWED_DOMAINS) {
            if (email.toLowerCase().endsWith(domain.toLowerCase())) {
                return true;
            }
        }
        return false;
    }

    /**
     * Validate password strength
     */
    private String validatePassword(String password) {
        if (password == null || password.length() < 8) {
            return "Password must be at least 8 characters long!";
        }
        if (!UPPERCASE_PATTERN.matcher(password).find()) {
            return "Password must contain at least one uppercase letter!";
        }
        if (!SPECIAL_CHAR_PATTERN.matcher(password).find()) {
            return "Password must contain at least one special character (!@#$%^&* etc.)!";
        }
        return null; // Valid
    }

    /**
     * Signup Logic
     */
    public String register(SignupRequest request) {
        // 1. Validate email domain
        if (!isValidEmailDomain(request.getEmail())) {
            return "Error: Only @banasthali.in or @gmail.com emails are allowed!";
        }

        // 2. Validate password strength
        String passwordError = validatePassword(request.getPassword());
        if (passwordError != null) {
            return "Error: " + passwordError;
        }

        // 3. Check if email already exists
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            return "Error: Email already registered!";
        }

        // 4. Map DTO to Entity
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole().toUpperCase());
        user.setClubId(request.getClubId());

        // For FACULTY role, clubId will be null initially
        // Admin will assign club later via /admin/officials/assign endpoint
        if (request.getRole() != null && "FACULTY".equalsIgnoreCase(request.getRole())) {
            user.setClubId(null); // Faculty starts without a club
        }

        // 5. Encrypt password using BCrypt
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // 6. Save to MySQL
        userRepository.save(user);
        return "User registered successfully!";
    }

    /**
     * Login Logic
     */
    public AuthResponse login(LoginRequest request) {
        // 1. Validate email domain
        if (!isValidEmailDomain(request.getEmail())) {
            throw new RuntimeException("Error: Only @banasthali.in or @gmail.com emails are allowed!");
        }

        // 2. Find user by email
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        // 3. Check if user exists
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Error: Email not registered. Please sign up first!");
        }

        User user = userOpt.get();

        // 4. Compare plain password with encrypted password in DB
        if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {

            // 5. Generate JWT Token
            String token = jwtUtils.generateToken(user.getEmail(), user.getRole(), user.getClubId());

            // 6. Return data for frontend
            return new AuthResponse(
                    token,
                    user.getRole(),
                    user.getFirstName(),
                    user.getClubId(),
                    user.getUserId(),
                    user.getEmail());
        } else {
            throw new RuntimeException("Error: Incorrect password!");
        }
    }
}