package com.nuwan.weeklyreport.dto.response;

import com.nuwan.weeklyreport.enums.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDto {
    private String id;
    private String name;
    private String description;
    private ProjectStatus status;
    private String colorToken;
    private List<String> memberIds;
    private String createdAt;
}
