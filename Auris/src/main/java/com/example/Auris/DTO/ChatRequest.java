package com.example.Auris.DTO;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ChatRequest {
    private String email;
    private String password;
    private String message;
    
}
