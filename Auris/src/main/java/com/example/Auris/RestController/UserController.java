package com.example.Auris.RestController;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import com.example.Auris.Model.User;
import com.example.Auris.Repository.UserRepository;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;
import java.util.Base64;
import java.io.IOException;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:3000"})
public class UserController {
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable String userId) {
        try {
            Long id = Long.parseLong(userId);
            Optional<User> userOptional = userRepository.findById(id);
            
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                
                // Debug logging
                System.out.println("Getting user: " + userId);
                System.out.println("User avatar length: " + 
                    (user.getAvatar() != null ? user.getAvatar().length() : "NULL"));
                
                Map<String, Object> userData = new HashMap<>();
                userData.put("id", user.getId());
                userData.put("email", user.getEmail());
                userData.put("phone", user.getPhone());
                userData.put("name", user.getName());
                userData.put("avatar", user.getAvatar());
                return ResponseEntity.ok(userData);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                     .body(Map.of("error", "User not found", "message", "No user found with ID: " + userId));
            }
            
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                 .body(Map.of("error", "Invalid user ID", "message", "User ID must be a valid number"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Map.of("error", "Server error", "message", e.getMessage()));
        }
    }
    
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable String userId, @RequestBody Map<String, Object> profileData) {
        try {
            Long id = Long.parseLong(userId);
            Optional<User> userOptional = userRepository.findById(id);
            
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                
                // Update fields if provided
                if (profileData.containsKey("email")) {
                    user.setEmail((String) profileData.get("email"));
                }
                if (profileData.containsKey("phone")) {
                    user.setPhone((String) profileData.get("phone"));
                }
                if (profileData.containsKey("name")) {
                    user.setName((String) profileData.get("name"));
                }
                if (profileData.containsKey("avatar")) {
                    user.setAvatar((String) profileData.get("avatar"));
                }
                
                user.updateTimestamp();
                User updatedUser = userRepository.save(user);
                
                Map<String, Object> userData = new HashMap<>();
                userData.put("id", updatedUser.getId());
                userData.put("email", updatedUser.getEmail());
                userData.put("phone", updatedUser.getPhone());
                userData.put("name", updatedUser.getName());
                userData.put("avatar", updatedUser.getAvatar());
                
                return ResponseEntity.ok(userData);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                     .body(Map.of("error", "User not found", "message", "No user found with ID: " + userId));
            }
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                 .body(Map.of("error", "Invalid user ID", "message", "User ID must be a valid number"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Map.of("error", "Failed to update user", "message", e.getMessage()));
        }
    }
    
    @PostMapping("/{userId}/avatar")
    public ResponseEntity<?> uploadAvatar(@PathVariable String userId, @RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                     .body(Map.of("error", "Empty file", "message", "Please select a file to upload"));
            }
            
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                     .body(Map.of("error", "Invalid file type", "message", "Only image files are allowed"));
            }
            
            // Validate file size (2MB limit for better performance)
            long maxFileSize = 2 * 1024 * 1024; // 2MB in bytes
            if (file.getSize() > maxFileSize) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                     .body(Map.of("error", "File too large", "message", "File size must be less than 2MB"));
            }
            
            // Additional validation for base64 size (base64 is ~33% larger than original)
            long estimatedBase64Size = (file.getSize() * 4) / 3;
            if (estimatedBase64Size > 8 * 1024 * 1024) { // 8MB limit for base64
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                     .body(Map.of("error", "Image too large for processing", "message", "Please use a smaller image or compress it"));
            }
            
            Long id = Long.parseLong(userId);
            Optional<User> userOptional = userRepository.findById(id);
            
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                
                // Log file details for debugging
                System.out.println("=== AVATAR UPLOAD DEBUG ===");
                System.out.println("User ID: " + userId);
                System.out.println("File size: " + file.getSize() + " bytes");
                System.out.println("File type: " + contentType);
                System.out.println("File name: " + file.getOriginalFilename());
                
                // Convert file to base64
                byte[] fileBytes = file.getBytes();
                String base64Avatar = Base64.getEncoder().encodeToString(fileBytes);
                String avatarWithPrefix = "data:" + contentType + ";base64," + base64Avatar;
                
                System.out.println("Base64 avatar length: " + avatarWithPrefix.length());
                System.out.println("Avatar prefix: " + avatarWithPrefix.substring(0, Math.min(50, avatarWithPrefix.length())));
                
                // Save to database
                user.setAvatar(avatarWithPrefix);
                user.updateTimestamp();
                
                System.out.println("Saving user to database...");
                
                try {
                    User updatedUser = userRepository.save(user);
                    
                    // Verify the avatar was saved
                    System.out.println("User saved. Avatar in DB: " + 
                        (updatedUser.getAvatar() != null ? updatedUser.getAvatar().length() + " characters" : "NULL"));
                    
                    // Double-check by fetching from database
                    User fetchedUser = userRepository.findById(id).orElse(null);
                    if (fetchedUser != null) {
                        System.out.println("Re-fetched user. Avatar in DB: " + 
                            (fetchedUser.getAvatar() != null ? fetchedUser.getAvatar().length() + " characters" : "NULL"));
                    }
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("avatar", updatedUser.getAvatar());
                    response.put("message", "Avatar uploaded successfully");
                    response.put("userId", updatedUser.getId());
                    
                    return ResponseEntity.ok(response);
                    
                } catch (Exception saveException) {
                    System.err.println("Database save error: " + saveException.getMessage());
                    saveException.printStackTrace();
                    
                    // Check if it's a quota/size related error
                    if (saveException.getMessage().contains("quota") || 
                        saveException.getMessage().contains("size") ||
                        saveException.getMessage().contains("too large")) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                           .body(Map.of("error", "Image too large for database", 
                                                      "message", "Please use a smaller image (under 1.5MB)"));
                    }
                    
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                       .body(Map.of("error", "Database error", 
                                                  "message", "Failed to save avatar to database"));
                }
                
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                     .body(Map.of("error", "User not found", "message", "No user found with ID: " + userId));
            }
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                 .body(Map.of("error", "Invalid user ID", "message", "User ID must be a valid number"));
        } catch (IOException e) {
            System.err.println("IO Error during avatar upload: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Map.of("error", "File processing error", "message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Unexpected error during avatar upload: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Map.of("error", "Failed to upload avatar", "message", e.getMessage()));
        }
    }
    
    @GetMapping("/debug/{userId}")
    public ResponseEntity<?> debugUser(@PathVariable String userId) {
        try {
            Long id = Long.parseLong(userId);
            Optional<User> userOptional = userRepository.findById(id);
            
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                Map<String, Object> debugData = new HashMap<>();
                debugData.put("id", user.getId());
                debugData.put("email", user.getEmail());
                debugData.put("phone", user.getPhone());
                debugData.put("name", user.getName());
                debugData.put("avatar", user.getAvatar() != null ? user.getAvatar().substring(0, Math.min(50, user.getAvatar().length())) + "..." : null);
                debugData.put("updatedAt", user.getUpdatedAt());
                
                return ResponseEntity.ok(debugData);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                     .body(Map.of("error", "User not found", "message", "No user found with ID: " + userId));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Map.of("error", "Debug error", "message", e.getMessage()));
        }
    }
}
