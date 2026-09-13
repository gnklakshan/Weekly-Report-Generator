package com.nuwan.weeklyreport.service.transformer;

import com.nuwan.weeklyreport.dao.entity.User;
import com.nuwan.weeklyreport.dto.response.UserResponseDto;

public class UserTransformer {
    public static UserResponseDto toUserDto(User user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        dto.setJobTitle(user.getJobTitle());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setProjectIds(user.getProjects().stream().map(p -> p.getId()).toList());
        dto.setManagerId(user.getManager() != null ? user.getManager().getId() : null);
        dto.setJoinedAt(user.getJoinedAt() != null ? user.getJoinedAt().toString() : null);
        return dto;
    }
}
