package com.example.Auris.Model;



import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;


@Entity
@Data
@Table(name = "app_user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;
    
    private String phone; // Optional phone number field
    
    private String name; // User's display name
    
    @Lob
    @Column(name = "avatar", columnDefinition = "CLOB")
    private String avatar; // Base64 encoded image or URL
    
    private LocalDateTime updatedAt;
    
    // Constructor to set timestamps
    public User() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Method to update timestamp before saving
    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }
}
