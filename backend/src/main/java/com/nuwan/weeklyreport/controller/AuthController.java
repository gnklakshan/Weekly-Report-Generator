package com.nuwan.weeklyreport.controller;

import com.nuwan.weeklyreport.dto.response.AuthResponse;
import com.nuwan.weeklyreport.dto.request.LoginRequest;
import com.nuwan.weeklyreport.dto.request.RegisterRequest;
import com.nuwan.weeklyreport.dto.response.UserDto;
import com.nuwan.weeklyreport.dao.entity.User;
import com.nuwan.weeklyreport.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

//    simple logout endpoint, it will pass logout success message
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/session")
    public ResponseEntity<UserDto> getSession(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(authService.getSession(user.getId()));
    }
}
