package com.nuwan.weeklyreport.service;

import com.nuwan.weeklyreport.config.JwtUtil;
import com.nuwan.weeklyreport.dao.repository.UserRepository;
import com.nuwan.weeklyreport.dto.response.AuthResponse;
import com.nuwan.weeklyreport.dto.request.LoginRequest;
import com.nuwan.weeklyreport.dto.request.RegisterRequest;
import com.nuwan.weeklyreport.dto.response.UserDto;
import com.nuwan.weeklyreport.dao.entity.User;
import com.nuwan.weeklyreport.enums.UserStatus;
import com.nuwan.weeklyreport.exception.ApiException;
import com.nuwan.weeklyreport.service.transformer.UserTransformer;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new ApiException("Invalid credentials", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApiException("Invalid credentials", HttpStatus.UNAUTHORIZED);
        }

        if (user.getStatus() == UserStatus.DEACTIVATED) {
            throw new ApiException("Account is deactivated", HttpStatus.FORBIDDEN);
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        AuthResponse response = new AuthResponse();
        response.setUser(UserTransformer.toUserDto(user));
        response.setToken(token);
        response.setIssuedAt(LocalDateTime.now().toString());
        return response;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ApiException("Passwords do not match", HttpStatus.BAD_REQUEST);
        }

        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new ApiException("Email already registered", HttpStatus.CONFLICT);
        }

        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setStatus(UserStatus.ACTIVE);
        user.setJobTitle("");
        user.setJoinedAt(LocalDate.now());
        user.setProjects(new java.util.HashSet<>());
        user.setDirectReports(new ArrayList<>());

        //save to db
        user = userRepository.save(user);
        //generate jwt token
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        //create response
        AuthResponse response = new AuthResponse();
        response.setUser(UserTransformer.toUserDto(user));
        response.setToken(token);
        response.setIssuedAt(LocalDateTime.now().toString());
        return response;
    }

    //check the current logged‑in user’s session
    public UserDto getSession(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("Session expired", HttpStatus.UNAUTHORIZED));
        return UserTransformer.toUserDto(user);
    }

}
