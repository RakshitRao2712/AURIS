package com.example.Auris.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PdfDocument {

     @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    private String fileName;

    @Lob
    private String content; // need to remove before 20

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    
}
