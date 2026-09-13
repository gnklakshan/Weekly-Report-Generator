package com.nuwan.weeklyreport.service;

import com.nuwan.weeklyreport.dao.repository.ProjectRepository;
import com.nuwan.weeklyreport.dao.repository.UserRepository;
import com.nuwan.weeklyreport.dto.request.CreateProjectRequest;
import com.nuwan.weeklyreport.dto.response.ProjectDto;
import com.nuwan.weeklyreport.dto.request.UpdateProjectRequest;
import com.nuwan.weeklyreport.dao.entity.Project;
import com.nuwan.weeklyreport.dao.entity.User;
import com.nuwan.weeklyreport.enums.ProjectStatus;
import com.nuwan.weeklyreport.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private static final String[] COLOR_TOKENS = {
            "chart-1", "chart-2", "chart-3", "chart-4", "chart-5"
    };

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public List<ProjectDto> getProjects(String search, ProjectStatus status) {
        List<Project> projects;

        if (search != null && !search.isBlank()) {
            projects = projectRepository.search(search);
        } else {
            projects = projectRepository.findAll();
        }

        if (status != null) {
            projects = projects.stream()
                    .filter(p -> p.getStatus() == status)
                    .collect(Collectors.toList());
        }

        return projects.stream().map(this::toDto).collect(Collectors.toList());
    }

    public ProjectDto getProject(String id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));
        return toDto(project);
    }

    @Transactional
    public ProjectDto createProject(CreateProjectRequest request) {
        Project project = new Project();
        project.setId(UUID.randomUUID().toString());
        project.setName(request.getName());
        project.setDescription(request.getDescription() != null ? request.getDescription() : "");
        project.setStatus(request.getStatus());

        long count = projectRepository.count();
        project.setColorToken(COLOR_TOKENS[(int) (count % COLOR_TOKENS.length)]);
        project.setCreatedAt(LocalDate.now());

        if (request.getMemberIds() != null) {
            Set<User> members = new HashSet<>(
                    userRepository.findAllById(request.getMemberIds()));
            project.setMembers(members);
            for (User member : members) {
                member.getProjects().add(project);
            }
        } else {
            project.setMembers(new HashSet<>());
        }

        project = projectRepository.save(project);
        return toDto(project);
    }

    @Transactional
    public ProjectDto updateProject(String id, UpdateProjectRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));

        if (request.getName() != null) project.setName(request.getName());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getStatus() != null) project.setStatus(request.getStatus());

        if (request.getMemberIds() != null) {
            for (User oldMember : project.getMembers()) {
                oldMember.getProjects().remove(project);
            }
            Set<User> newMembers = new HashSet<>(
                    userRepository.findAllById(request.getMemberIds()));
            project.setMembers(newMembers);
            for (User newMember : newMembers) {
                newMember.getProjects().add(project);
            }
        }

        project = projectRepository.save(project);
        return toDto(project);
    }

    @Transactional
    public void deleteProject(String id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));

        for (User member : project.getMembers()) {
            member.getProjects().remove(project);
            userRepository.save(member);
        }

        projectRepository.delete(project);
    }

    private ProjectDto toDto(Project project) {
        ProjectDto dto = new ProjectDto();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setStatus(project.getStatus());
        dto.setColorToken(project.getColorToken());
        dto.setMemberIds(
                project.getMembers() != null
                        ? project.getMembers().stream().map(User::getId).toList()
                        : List.of());
        dto.setCreatedAt(project.getCreatedAt() != null ? project.getCreatedAt().toString() : null);
        return dto;
    }
}
