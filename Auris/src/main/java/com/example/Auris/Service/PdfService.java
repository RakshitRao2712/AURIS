package com.example.Auris.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.Auris.Model.PdfDocument;
import com.example.Auris.Model.User;
import com.example.Auris.Repository.PdfRepository;
import com.example.Auris.Repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpSession;

@Service
public class PdfService {
    @Autowired
    private PdfRepository pdfRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WebClient.Builder wBuilder;

    @Value("${groq.api.url}")
    private String ApiGroqUrl;

    @Value("${groq.api.key}")
    private String ApiGroqKey;

    private String extractTextFromPDF(MultipartFile file) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

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

    public String askAI(HttpSession session, String question) {
        String email = (String) session.getAttribute("userEmail");
        if (email == null) {
            throw new RuntimeException("User not logged in");
        }
        PdfDocument pdf = pdfRepository.findTopByUserEmailOrderByIdDesc(email);
        String prompt = "Answer this based on the document content:\n\n" +
                        pdf.getContent() + "\n\nQuestion: " + question;

        Map<String, Object> requestBody = Map.of(
            "model", "llama3-70b-8192",
            "messages", List.of(
                Map.of("role", "user", "content", prompt)
            )
        );

        return sendToGroq(requestBody);
    }

    public String storeAndProcessPDF(MultipartFile file, HttpSession session) throws IOException {
        String email = (String) session.getAttribute("userEmail");
        if (email == null) {
            throw new RuntimeException("User not logged in");
        }
        String extractedText = extractTextFromPDF(file);
        User user = userRepository.findByEmail(email).orElseThrow();
        PdfDocument pdfDoc = new PdfDocument(null, file.getOriginalFilename(), extractedText, user);
        pdfRepository.save(pdfDoc);
        return "PDF uploaded and processed successfully!";
    }


    
}
