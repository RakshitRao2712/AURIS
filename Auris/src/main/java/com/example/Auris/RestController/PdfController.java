package com.example.Auris.RestController;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.Auris.Service.PdfService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/pdf")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:3002", "http://127.0.0.1:3002"}, allowCredentials = "true")
public class PdfController {
    @Autowired
    private PdfService pdfService;
    @PostMapping("/upload")
    public ResponseEntity<String> uploadPDF(@RequestParam("file") MultipartFile file, HttpSession session) throws IOException {
        String email = (String) session.getAttribute("userEmail");
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not logged in");
        }
        return ResponseEntity.ok(pdfService.storeAndProcessPDF(file, session));
    }

    @PostMapping("/ask")
    public ResponseEntity<String> askQuestion(@RequestParam("question") String question, HttpSession session) {
        String email = (String) session.getAttribute("userEmail");
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not logged in");
        }
        return ResponseEntity.ok(pdfService.askAI(session, question));
    }
}
