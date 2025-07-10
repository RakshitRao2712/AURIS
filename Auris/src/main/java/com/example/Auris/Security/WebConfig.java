package com.example.Auris.Security;

import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")  // allow all paths
        .allowedOrigins(
            "http://127.0.0.1:8080", 
            "http://localhost:8080",
            "http://localhost:3000",    // Next.js default port
            "http://127.0.0.1:3000",
            "http://localhost:3001",    // Alternative frontend port
            "http://127.0.0.1:3001",
            "https://*.vercel.app",     // Vercel deployments
            "https://*.herokuapp.com",  // Heroku deployments
            "https://*.railway.app",    // Railway deployments
            "https://*.up.railway.app"  // Railway custom domains
        )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
