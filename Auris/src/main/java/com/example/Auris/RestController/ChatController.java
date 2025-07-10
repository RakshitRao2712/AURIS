package com.example.Auris.RestController;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Auris.DTO.ChatRequest;
import com.example.Auris.DTO.ChatResponse;
import com.example.Auris.Service.ChatService;

import jakarta.servlet.http.HttpSession;



@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:3002", "http://127.0.0.1:3002"}, allowCredentials = "true")
public class ChatController {
    
    @Autowired
    private ChatService chatService;

    @PostMapping("/generate")
    public ResponseEntity<ChatResponse> generateResponse(@RequestBody ChatRequest chatRequest, HttpSession session) {
    String email = (String) session.getAttribute("userEmail");
    if (email == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                             .body(new ChatResponse("User not logged in"));
    }
        String aiResponse = chatService.generateChatResponse(chatRequest, session);
        ChatResponse response = new ChatResponse(aiResponse);
        return ResponseEntity.ok(response);
    }
}
