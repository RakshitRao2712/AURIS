package com.example.Auris.RestController;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Auris.Model.User;
import com.example.Auris.Repository.UserRepository;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

// Google OAuth imports
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.util.Collections;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:3000"}, allowCredentials = "true")
public class AuthController {
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register( @Valid @RequestBody User user) {
        try {
            System.out.println("Registration attempt for email: " + user.getEmail());
            System.out.println("User object: " + user.toString());
            
            // Check if user already exists
            if (userRepository.findByEmail(user.getEmail()).isPresent()) {
                System.out.println("User already exists: " + user.getEmail());
                Map<String, String> error = new HashMap<>();
                error.put("error", "User already exists");
                error.put("message", "A user with this email already exists");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            }
            
            System.out.println("Encoding password and saving user...");
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            User savedUser = userRepository.save(user);
            System.out.println("User saved successfully with ID: " + savedUser.getId());
            
            // Return user data as JSON
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("userId", savedUser.getId());
            response.put("email", savedUser.getEmail());
            response.put("name", savedUser.getName());
            response.put("phone", savedUser.getPhone());
            response.put("avatar", savedUser.getAvatar());
            response.put("token", "temp-token-" + savedUser.getId()); // In real app, generate JWT
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Registration failed with exception: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Registration failed");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody User loginUser, HttpSession session) {
        try {
            User user = userRepository.findByEmail(loginUser.getEmail()).orElse(null);
            if (user != null && passwordEncoder.matches(loginUser.getPassword(), user.getPassword())) {
                session.setAttribute("userEmail", user.getEmail());
                
                // Return user data as JSON
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login successful");
                response.put("userId", user.getId());
                response.put("email", user.getEmail());
                response.put("name", user.getName());
                response.put("phone", user.getPhone());
                response.put("avatar", user.getAvatar());
                response.put("token", "temp-token-" + user.getId()); // In real app, generate JWT
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid credentials");
                error.put("message", "Email or password is incorrect");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Login failed");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logged out successfully");
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@RequestBody Map<String, String> request, HttpSession session) {
        try {
            String credential = request.get("credential");
            if (credential == null || credential.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Missing credential");
                error.put("message", "Google credential is required");
                return ResponseEntity.badRequest().body(error);
            }

            System.out.println("Processing Google OAuth credential...");
            
            // Verify the Google ID token
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), 
                    new GsonFactory())
                    .setAudience(Collections.singletonList("308626026639-mjsot4dvjkc6a62j76ahjh4hrfogu419.apps.googleusercontent.com"))
                    .build();
            
            GoogleIdToken idToken = verifier.verify(credential);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                
                String email = payload.getEmail();
                String name = (String) payload.get("name");
                String pictureUrl = (String) payload.get("picture");
                
                System.out.println("Google OAuth successful for email: " + email);
                
                // Check if user exists
                Optional<User> existingUser = userRepository.findByEmail(email);
                User user;
                
                if (existingUser.isPresent()) {
                    // User exists, update their information
                    user = existingUser.get();
                    if (name != null && !name.trim().isEmpty()) {
                        user.setName(name);
                    }
                    if (pictureUrl != null && !pictureUrl.trim().isEmpty()) {
                        user.setAvatar(pictureUrl);
                    }
                    user = userRepository.save(user);
                    System.out.println("Updated existing user: " + user.getId());
                } else {
                    // Create new user
                    user = new User();
                    user.setEmail(email);
                    user.setName(name != null ? name : "");
                    user.setAvatar(pictureUrl != null ? pictureUrl : "");
                    user.setPhone(""); // Empty phone for Google users
                    user.setPassword(passwordEncoder.encode("google-oauth-" + System.currentTimeMillis())); // Random password
                    user = userRepository.save(user);
                    System.out.println("Created new Google user: " + user.getId());
                }
                
                // Set session
                session.setAttribute("userEmail", user.getEmail());
                
                // Return user data
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Google authentication successful");
                response.put("userId", user.getId());
                response.put("email", user.getEmail());
                response.put("name", user.getName());
                response.put("phone", user.getPhone());
                response.put("avatar", user.getAvatar());
                response.put("picture", user.getAvatar()); // For compatibility
                response.put("token", "temp-token-" + user.getId());
                
                return ResponseEntity.ok(response);
            } else {
                System.out.println("Invalid Google ID token");
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid token");
                error.put("message", "Google ID token verification failed");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
        } catch (Exception e) {
            System.out.println("Google OAuth failed: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Google authentication failed");
            error.put("message", "An error occurred during Google authentication: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

}
