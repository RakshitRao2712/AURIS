package com.example.Auris.DTO;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatHistory {
    private String userMessage;
    private String aiResponse;
    private LocalDateTime timestamp;
}
