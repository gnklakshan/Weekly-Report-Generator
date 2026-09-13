package com.nuwan.weeklyreport.controller;

import com.nuwan.weeklyreport.dto.request.CreateUserRequest;
import com.nuwan.weeklyreport.dto.request.UpdateUserRequest;
import com.nuwan.weeklyreport.dto.response.UserResponseDto;
import com.nuwan.weeklyreport.enums.UserRole;
import com.nuwan.weeklyreport.enums.UserStatus;
import com.nuwan.weeklyreport.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status) {

        UserRole roleEnum = role != null && !"ALL".equals(role) ? UserRole.valueOf(role) : null;
        UserStatus statusEnum = status != null && !"ALL".equals(status)
                ? UserStatus.valueOf(status) : null;

        return ResponseEntity.ok(userService.getUsers(search, roleEnum, statusEnum));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getUser(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUser(id));
    }

    @PostMapping
    public ResponseEntity<UserResponseDto> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDto> updateUser(@PathVariable String id,
                                                      @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
