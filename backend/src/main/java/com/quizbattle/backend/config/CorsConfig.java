package com.quizbattle.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global CORS configuration.
 *
 * In production the frontend (Nginx) and backend are on the same Docker network
 * and the browser only ever talks to Nginx on port 80, which reverse-proxies
 * /api/* to this backend — so CORS is not strictly required.
 *
 * However, this config ensures the app also works correctly when:
 *   • Running locally (frontend dev-server on :5173, backend on :8080)
 *   • Accessed via the EC2 public IP or a custom domain
 */
@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        // Local development
                        .allowedOrigins(
                                "http://localhost:5173",
                                "http://localhost:3000",
                                // Docker / EC2 — Nginx on port 80
                                "http://localhost",
                                // Allow any EC2 public IP (wildcard for flexibility)
                                // Replace with your actual domain/IP for tighter security
                                "http://*"
                        )
                        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(false)
                        .maxAge(3600);
            }
        };
    }
}
