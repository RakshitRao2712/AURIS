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

import com.example.Auris.Service.ImageService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;



@RestController
@RequestMapping("/api/image")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:3002", "http://127.0.0.1:3002"}, allowCredentials = "true")
@RequiredArgsConstructor
public class ImageController {

    @Autowired
    private ImageService imageService;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file,
                                              @RequestParam("question") String question,
                                              HttpSession session) throws IOException {
    String email = (String) session.getAttribute("userEmail");
    if (email == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not logged in");
    }
        String aiResponse = imageService.storeAndAskFromImage(file, session, question);
        return ResponseEntity.ok(aiResponse);
    }
     
}
