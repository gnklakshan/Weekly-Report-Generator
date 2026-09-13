package com.nuwan.weeklyreport.service;

import com.nuwan.weeklyreport.dao.repository.ProjectRepository;
import com.nuwan.weeklyreport.dao.repository.UserRepository;
import com.nuwan.weeklyreport.dto.request.CreateProjectRequest;
import com.nuwan.weeklyreport.dto.response.ProjectResponseDto;
import com.nuwan.weeklyreport.dto.request.UpdateProjectRequest;
import com.nuwan.weeklyreport.dao.entity.Project;
import com.nuwan.weeklyreport.dao.entity.User;
import com.nuwan.weeklyreport.enums.ProjectStatus;
import com.nuwan.weeklyreport.exception.ResourceNotFoundException;
import com.nuwan.weeklyreport.service.transformer.ProjectTransformer;
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

    public List<ProjectResponseDto> getProjects(String search, ProjectStatus status) {
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

        return projects.stream().map(ProjectTransformer::toDto).collect(Collectors.toList());
    }

    public ProjectResponseDto getProject(String id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));
        return ProjectTransformer.toDto(project);
    }

    @Transactional
    public ProjectResponseDto createProject(CreateProjectRequest request) {
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
        return ProjectTransformer.toDto(project);
    }

    @Transactional
    public ProjectResponseDto updateProject(String id, UpdateProjectRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));

        if (request.getName() != null)
            project.setName(request.getName());
        if (request.getDescription() != null)
            project.setDescription(request.getDescription());
        if (request.getStatus() != null)
            project.setStatus(request.getStatus());

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
        return ProjectTransformer.toDto(project);
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

}
