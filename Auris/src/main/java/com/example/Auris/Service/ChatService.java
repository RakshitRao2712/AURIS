package com.example.Auris.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;


import com.example.Auris.DTO.ChatRequest;
import com.example.Auris.Model.ChatHistory;
import com.example.Auris.Model.User;
import com.example.Auris.Repository.ChatHistoryRepo;
import com.example.Auris.Repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpSession;



@Service 
public class ChatService {
    
    @Value("${groq.api.url}")
    private String ApiGroqUrl;

    @Value("${groq.api.key}")
    private String ApiGroqKey;

    

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChatHistoryRepo chatHistoryRepo;

    @Autowired
    private WebClient.Builder wBuilder;


    public String generateChatResponse(ChatRequest chatRequest, HttpSession session){
        
        String email = (String) session.getAttribute("userEmail");
    if (email == null) {
        throw new RuntimeException("User is not logged in");
    }
    User user = userRepository.findByEmail(email)
    .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> requestBody = Map.of(
            "model", "llama3-70b-8192", 
            "messages", List.of(
                Map.of(
                    "role", "user",
                    "content", chatRequest.getMessage()
                )
            )
        );

        try {
            System.out.println(new ObjectMapper().writeValueAsString(requestBody));
        } catch (JsonProcessingException e) {
           
            e.printStackTrace();
        }

    String responseText = sendReqToGroq(requestBody);



    ChatHistory chatHistory = new ChatHistory();
    chatHistory.setUserMessage(chatRequest.getMessage());
    chatHistory.setAiResponse(responseText);
    chatHistory.setTimestamp(LocalDateTime.now());
    chatHistory.setUser(user);
    chatHistoryRepo.save(chatHistory);


        return responseText;

 }

 public String sendReqToGroq(Map<String, Object> requestBody){
    try {
        WebClient webClient = wBuilder.build();
        String response = webClient.post()
                        .uri(ApiGroqUrl)
                        .header("Authorization", "Bearer " + ApiGroqKey)
                        .header("Content-Type", "application/json")
                        .bodyValue(requestBody)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();

                    return extractResponseContent(response);
    } catch (Exception e) {
      return "error communicating with AI" + e.getMessage();
    }
 }

 private String extractResponseContent(String response) {
     try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);
            return root.path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();
        } catch (Exception e) {
            return "Error parsing response: " + e.getMessage();
        }
   
 }


 public List<ChatHistory> getChatHistory(String email) {
    Optional<User> userOpt = userRepository.findByEmail(email);
    return userOpt.map(chatHistoryRepo::findByUser).orElse(List.of());
}



}
