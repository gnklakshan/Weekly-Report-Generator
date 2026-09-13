package com.nuwan.weeklyreport.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDto {
    private DashboardMetricsDto metrics;
    private List<TrendPointDto> trend;
    private List<StatusByMemberPointDto> statusByMember;
    private List<ProjectWorkloadSliceDto> workloadByProject;
    private List<TaskTypeSliceDto> timeByTaskType;
    private List<ActivityItemDto> activity;
    private List<TeamMemberStatsDto> teamStats;
}
