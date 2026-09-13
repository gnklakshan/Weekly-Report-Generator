package com.nuwan.weeklyreport.dto.request;

import com.nuwan.weeklyreport.enums.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProjectRequest {
    private String name;
    private String description;
    private ProjectStatus status;
    private List<String> memberIds;
}
