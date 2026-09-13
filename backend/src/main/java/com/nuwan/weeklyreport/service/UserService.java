package com.nuwan.weeklyreport.service;

import com.nuwan.weeklyreport.dao.repository.ProjectRepository;
import com.nuwan.weeklyreport.dao.repository.UserRepository;
import com.nuwan.weeklyreport.dto.request.CreateUserRequest;
import com.nuwan.weeklyreport.dto.request.UpdateUserRequest;
import com.nuwan.weeklyreport.dto.response.UserResponseDto;
import com.nuwan.weeklyreport.dao.entity.Project;
import com.nuwan.weeklyreport.dao.entity.User;
import com.nuwan.weeklyreport.enums.UserRole;
import com.nuwan.weeklyreport.enums.UserStatus;
import com.nuwan.weeklyreport.exception.ApiException;
import com.nuwan.weeklyreport.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    public UserService(UserRepository userRepository, ProjectRepository projectRepository) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
    }

    public List<UserResponseDto> getUsers(String search, UserRole role, UserStatus status) {
        List<User> users;

        if (search != null && !search.isBlank()) {
            users = userRepository.search(search);
        } else {
            users = userRepository.findAll();
        }

        if (role != null) {
            users = users.stream()
                    .filter(u -> u.getRole() == role)
                    .collect(Collectors.toList());
        }
        if (status != null) {
            users = users.stream()
                    .filter(u -> u.getStatus() == status)
                    .collect(Collectors.toList());
        }

        return users.stream().map(this::toDto).collect(Collectors.toList());
    }

    public UserResponseDto getUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return toDto(user);
    }

    @Transactional
    public UserResponseDto createUser(CreateUserRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new ApiException("Email already registered", HttpStatus.CONFLICT);
        }

        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail().toLowerCase());
        user.setPassword("");
        user.setRole(request.getRole());
        user.setStatus(UserStatus.INVITED);
        user.setJobTitle(request.getJobTitle());
        user.setJoinedAt(LocalDate.now());
        user.setProjects(new HashSet<>());
        user.setDirectReports(new ArrayList<>());

        if (request.getProjectIds() != null) {
            Set<Project> projects = new HashSet<>(
                    projectRepository.findAllById(request.getProjectIds()));
            user.setProjects(projects);
        }

        if (user.getRole() == UserRole.TEAM_MEMBER) {
            userRepository.findByEmailIgnoreCase("manager@example.com")
                    .ifPresent(user::setManager);
        }

        user = userRepository.save(user);
        return toDto(user);
    }

    @Transactional
    public UserResponseDto updateUser(String id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getStatus() != null) user.setStatus(request.getStatus());
        if (request.getJobTitle() != null) user.setJobTitle(request.getJobTitle());

        if (request.getProjectIds() != null) {
            Set<Project> projects = new HashSet<>(
                    projectRepository.findAllById(request.getProjectIds()));
            user.setProjects(projects);
        }

        user = userRepository.save(user);
        return toDto(user);
    }

    @Transactional
    public void deleteUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        for (Project project : user.getProjects()) {
            project.getMembers().remove(user);
            projectRepository.save(project);
        }

        userRepository.delete(user);
    }

    private UserResponseDto toDto(User user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        dto.setJobTitle(user.getJobTitle());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setProjectIds(
                user.getProjects() != null
                        ? user.getProjects().stream().map(Project::getId).toList()
                        : List.of());
        dto.setManagerId(user.getManager() != null ? user.getManager().getId() : null);
        dto.setJoinedAt(user.getJoinedAt() != null ? user.getJoinedAt().toString() : null);
        return dto;
    }
}
