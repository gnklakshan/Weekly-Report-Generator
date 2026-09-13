package com.nuwan.weeklyreport.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectWorkloadSliceDto {
    private String projectId;
    private String projectName;
    private String colorToken;
    private double hours;
    private int reports;
}
