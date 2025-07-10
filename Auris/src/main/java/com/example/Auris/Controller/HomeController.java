package com.example.Auris.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        
        return "index"; 
    }

    @GetMapping("/login")
    public String loginPage() {
        return "login"; 
    }

    @GetMapping("/register")
    public String Register() {
        return "register"; 
    }
    @GetMapping("/dashboard")
    public String dashboard() {
        return "dashboard"; 
    }
    
    @GetMapping("/about")
    public String about() {
        return "about"; 
    }
    
    @GetMapping("/groq-api")
    public String groqApi() {
        return "groq-api"; 
    }
    
    @GetMapping("/document")
    public String document() {
        return "document"; 
    }
    
    @GetMapping("/you")
    public String you() {
        return "you"; 
    }
    
    @GetMapping("/you-new")
    public String youNew() {
        return "you-new"; 
    }
}

