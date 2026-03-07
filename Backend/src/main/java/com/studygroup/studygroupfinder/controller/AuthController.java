package com.studygroup.studygroupfinder.controller;
import com.studygroup.studygroupfinder.dto.SignInRequest;
import com.studygroup.studygroupfinder.dto.SignUpRequest;
import com.studygroup.studygroupfinder.model.User;
import com.studygroup.studygroupfinder.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AuthController {
    @Autowired
    private AuthService authService;
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@Valid @RequestBody SignUpRequest signUpRequest) {
        try {
            User user = authService.signUp(signUpRequest);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("user", Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "university", user.getUniversity(),
                "passingYear", user.getPassingYear(),
                "passingGpa", user.getPassingGpa(),
                "memberSince", user.getMemberSince()
            ));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    @PostMapping("/signin")
    public ResponseEntity<?> signIn(@Valid @RequestBody SignInRequest signInRequest) {
        try {
            String token = authService.signIn(signInRequest);
            User user = authService.getUserByEmail(signInRequest.getEmail());
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "university", user.getUniversity(),
                "passingYear", user.getPassingYear(),
                "passingGpa", user.getPassingGpa(),
                "memberSince", user.getMemberSince()
            ));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@RequestHeader("Authorization") String token) {
        try {
            // Remove "Bearer " prefix
            String jwtToken = token.substring(7);
            String email = jwtService.extractEmail(jwtToken);
            User user = authService.getUserByEmail(email);
            
            Map<String, Object> response = new HashMap<>();
            response.put("user", Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "university", user.getUniversity(),
                "passingYear", user.getPassingYear(),
                "passingGpa", user.getPassingGpa(),
                "profileImageUrl", user.getProfileImageUrl(),
                "memberSince", user.getMemberSince()
            ));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid token");
            return ResponseEntity.badRequest().body(error);
        }
    }
    @Autowired
    private com.studygroup.studygroupfinder.service.JwtService jwtService;
}
