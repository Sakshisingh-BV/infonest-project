package com.infonest.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    
    private String token;
    private String role;
    private String firstName;
    private String clubId;
    private Long userId;
    private String email;
}
