package com.nuwan.weeklyreport.controller;

import com.nuwan.weeklyreport.dto.request.CreateProjectRequest;
import com.nuwan.weeklyreport.dto.response.ProjectResponseDto;
import com.nuwan.weeklyreport.dto.request.UpdateProjectRequest;
import com.nuwan.weeklyreport.enums.ProjectStatus;
import com.nuwan.weeklyreport.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectResponseDto> createProject(@Valid @RequestBody CreateProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(request));
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponseDto>> getProjects(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {

        ProjectStatus statusEnum = status != null && !"ALL".equals(status)
                ? ProjectStatus.valueOf(status) : null;

        return ResponseEntity.ok(projectService.getProjects(search, statusEnum));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponseDto> getProject(@PathVariable String id) {
        return ResponseEntity.ok(projectService.getProject(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectResponseDto> updateProject(@PathVariable String id,
                                                            @RequestBody UpdateProjectRequest request) {
        return ResponseEntity.ok(projectService.updateProject(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProject(@PathVariable String id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
}
