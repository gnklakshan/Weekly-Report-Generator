package com.nuwan.weeklyreport.service.transformer;

import com.nuwan.weeklyreport.dao.entity.Project;
import com.nuwan.weeklyreport.dao.entity.User;
import com.nuwan.weeklyreport.dto.response.ProjectResponseDto;

import java.util.List;

public class ProjectTransformer {

    public static ProjectResponseDto toDto(Project project) {
        ProjectResponseDto dto = new ProjectResponseDto();
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
