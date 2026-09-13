package com.nuwan.weeklyreport.controller;

import com.nuwan.weeklyreport.dto.request.CreateProjectRequest;
import com.nuwan.weeklyreport.dto.response.ProjectDto;
import com.nuwan.weeklyreport.dto.request.UpdateProjectRequest;
import com.nuwan.weeklyreport.enums.ProjectStatus;
import com.nuwan.weeklyreport.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public ResponseEntity<List<ProjectDto>> getProjects(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {

        ProjectStatus statusEnum = status != null && !"ALL".equals(status)
                ? ProjectStatus.valueOf(status) : null;

        return ResponseEntity.ok(projectService.getProjects(search, statusEnum));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getProject(@PathVariable String id) {
        return ResponseEntity.ok(projectService.getProject(id));
    }

    @PostMapping
    public ResponseEntity<ProjectDto> createProject(@Valid @RequestBody CreateProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDto> updateProject(@PathVariable String id,
                                                    @RequestBody UpdateProjectRequest request) {
        return ResponseEntity.ok(projectService.updateProject(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable String id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
}
