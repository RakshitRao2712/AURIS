package com.example.Auris.Service;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Map;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.Auris.Model.Image;
import com.example.Auris.Model.User;
import com.example.Auris.Repository.ImageRepository;
import com.example.Auris.Repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpSession;


@Service
public class ImageService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private WebClient.Builder wBuilder;

    @Value("${groq.api.url}")
    private String ApiGroqUrl;

    @Value("${groq.api.key}")
    private String ApiGroqKey;

    private String sendToGroq(Map<String, Object> requestBody) {
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

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);
            return root.path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            return "Error communicating with AI: " + e.getMessage();
        }
    }
     public String storeAndAskFromImage(MultipartFile file, HttpSession session, String question) throws IOException {
        String email = (String) session.getAttribute("userEmail");
    if (email == null) {
        throw new RuntimeException("User not logged in");
    }
        byte[] imageBytes = file.getBytes();
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);
        String imageDataUrl = "data:image/png;base64," + base64Image;

        Map<String, Object> requestBody = Map.of(
            "model", "meta-llama/llama-4-scout-17b-16e-instruct",
            "temperature", 1,
            "max_completion_tokens", 1024,
            "top_p", 1,
            "stream", false,
            "messages", List.of(
                Map.of(
                    "role", "user",
                    "content", List.of(
                        Map.of("type", "text", "text", question),
                        Map.of("type", "image_url", "image_url", Map.of("url", imageDataUrl))
                    )
                )
            )
        );

        String aiResponse = sendToGroq(requestBody);

        User user = userRepository.findByEmail(email).orElseThrow();
        Image imageDoc = new Image();
        imageDoc.setFileName(file.getOriginalFilename());
        imageDoc.setImageData(imageBytes);
        imageDoc.setAiResponse(aiResponse);
        imageDoc.setUser(user);
        imageRepository.save(imageDoc);

        return aiResponse;
    }  
}
