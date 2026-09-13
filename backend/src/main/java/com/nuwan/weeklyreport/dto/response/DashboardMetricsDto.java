package com.nuwan.weeklyreport.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardMetricsDto {
    private int expectedReports;
    private int submittedReports;
    private double complianceRate;
    private int needsCorrection;
    private int approved;
    private int openBlockers;
    private int tasksCompleted;
    private double totalHours;
}
