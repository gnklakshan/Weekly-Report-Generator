package com.nuwan.weeklyreport.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberStatsDto {
    private String memberId;
    private String memberName;
    private String jobTitle;
    private String currentWeekStatus;
    private int reportsSubmitted;
    private double approvalRate;
    private int tasksCompleted;
    private double hours;
    private int openBlockers;
    private double averageHours;
}
