package com.nuwan.weeklyreport.dto.response;

import com.nuwan.weeklyreport.enums.ReportStatus;
import com.nuwan.weeklyreport.enums.TaskType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponseDto {
    private String id;
    private String authorId;
    private String projectId;
    private String weekStart;
    private String weekEnd;
    private ReportStatus status;
    private List<ReportTaskDto> completedTasks;
    private List<PlannedTaskDto> nextWeekTasks;
    private List<BlockerDto> blockers;
    private List<AchievementDto> achievements;
    private Map<TaskType, Double> hours;
    private String notes;
    private List<ReportLinkDto> links;
    private List<ReportVersionDto> versions;
    private List<ReviewCommentDto> reviewComments;
    private int currentVersion;
    private String createdAt;
    private String updatedAt;
    private String submittedAt;
    private String reviewedAt;
    private String reviewedById;
}
