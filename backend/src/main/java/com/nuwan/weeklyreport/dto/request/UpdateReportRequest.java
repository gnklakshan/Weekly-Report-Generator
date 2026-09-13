package com.nuwan.weeklyreport.dto.request;

import com.nuwan.weeklyreport.dto.response.*;
import com.nuwan.weeklyreport.enums.TaskType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReportRequest {
    private String projectId;
    private String weekStart;
    private String weekEnd;
    private List<ReportTaskDto> completedTasks;
    private List<PlannedTaskDto> nextWeekTasks;
    private List<BlockerDto> blockers;
    private List<AchievementDto> achievements;
    private Map<TaskType, Double> hours;
    private String notes;
    private List<ReportLinkDto> links;
}
