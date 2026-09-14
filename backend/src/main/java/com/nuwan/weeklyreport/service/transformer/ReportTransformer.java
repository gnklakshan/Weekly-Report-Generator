package com.nuwan.weeklyreport.service.transformer;

import com.nuwan.weeklyreport.dao.entity.*;
import com.nuwan.weeklyreport.dto.response.*;

import java.util.HashMap;
import java.util.List;
import java.util.UUID;

public class ReportTransformer {

    public static ReportTask toReportTaskEntity(ReportTaskDto dto, Report report) {
        ReportTask task = new ReportTask();
        task.setId(dto.getId() != null ? dto.getId() : UUID.randomUUID().toString());
        task.setReport(report);
        task.setTitle(dto.getTitle());
        task.setPriority(dto.getPriority());
        task.setPlannedPercent(dto.getPlannedPercent());
        task.setActualPercent(dto.getActualPercent());
        task.setStatus(dto.getStatus());
        task.setPlannedHours(dto.getPlannedHours());
        task.setSpentHours(dto.getSpentHours());
        task.setOutput(dto.getOutput());
        return task;
    }

    public static PlannedTask toPlannedTaskEntity(PlannedTaskDto dto, Report report) {
        PlannedTask task = new PlannedTask();
        task.setId(dto.getId() != null ? dto.getId() : UUID.randomUUID().toString());
        task.setReport(report);
        task.setTitle(dto.getTitle());
        task.setPriority(dto.getPriority());
        task.setPlannedHours(dto.getPlannedHours());
        return task;
    }

    public static Blocker toBlockerEntity(BlockerDto dto, Report report) {
        Blocker blocker = new Blocker();
        blocker.setId(dto.getId() != null ? dto.getId() : UUID.randomUUID().toString());
        blocker.setReport(report);
        blocker.setDescription(dto.getDescription());
        blocker.setKeyIssue(dto.getKeyIssue() != null ? dto.getKeyIssue() : false);
        return blocker;
    }

    public static Achievement toAchievementEntity(AchievementDto dto, Report report) {
        Achievement achievement = new Achievement();
        achievement.setId(dto.getId() != null ? dto.getId() : UUID.randomUUID().toString());
        achievement.setReport(report);
        achievement.setDescription(dto.getDescription());
        achievement.setKeyAchievement(dto.getKeyAchievement() != null ? dto.getKeyAchievement() : false);
        return achievement;
    }

    public static ReportLink toReportLinkEntity(ReportLinkDto dto, Report report) {
        ReportLink link = new ReportLink();
        link.setId(dto.getId() != null ? dto.getId() : UUID.randomUUID().toString());
        link.setReport(report);
        link.setLabel(dto.getLabel());
        link.setUrl(dto.getUrl());
        return link;
    }

    public static ReportResponseDto toDto(Report report) {
        ReportResponseDto dto = new ReportResponseDto();
        dto.setId(report.getId());
        dto.setAuthorId(report.getAuthor() != null ? report.getAuthor().getId() : null);
        dto.setProjectId(report.getProject() != null ? report.getProject().getId() : null);
        dto.setWeekStart(report.getWeekStart() != null ? report.getWeekStart().toString() : null);
        dto.setWeekEnd(report.getWeekEnd() != null ? report.getWeekEnd().toString() : null);
        dto.setStatus(report.getStatus());
        dto.setCurrentVersion(report.getCurrentVersion());
        dto.setNotes(report.getNotes());
        dto.setHours(report.getHours() != null ? report.getHours() : new HashMap<>());
        dto.setCreatedAt(report.getCreatedAt() != null ? report.getCreatedAt().toString() : null);
        dto.setUpdatedAt(report.getUpdatedAt() != null ? report.getUpdatedAt().toString() : null);
        dto.setSubmittedAt(report.getSubmittedAt() != null ? report.getSubmittedAt().toString() : null);
        dto.setReviewedAt(report.getReviewedAt() != null ? report.getReviewedAt().toString() : null);
        dto.setReviewedById(report.getReviewedBy() != null ? report.getReviewedBy().getId() : null);

        dto.setCompletedTasks(report.getCompletedTasks() != null
                ? report.getCompletedTasks().stream().map(ReportTransformer::toReportTaskDto).toList()
                : List.of());
        dto.setNextWeekTasks(report.getNextWeekTasks() != null
                ? report.getNextWeekTasks().stream().map(ReportTransformer::toPlannedTaskDto).toList()
                : List.of());
        dto.setBlockers(report.getBlockers() != null
                ? report.getBlockers().stream().map(ReportTransformer::toBlockerDto).toList()
                : List.of());
        dto.setAchievements(report.getAchievements() != null
                ? report.getAchievements().stream().map(ReportTransformer::toAchievementDto).toList()
                : List.of());
        dto.setLinks(report.getLinks() != null
                ? report.getLinks().stream().map(ReportTransformer::toReportLinkDto).toList()
                : List.of());
        dto.setVersions(report.getVersions() != null
                ? report.getVersions().stream().map(ReportTransformer::toVersionDto).toList()
                : List.of());
        dto.setReviewComments(report.getReviewComments() != null
                ? report.getReviewComments().stream().map(ReportTransformer::toReviewCommentDto).toList()
                : List.of());

        return dto;
    }

    public static ReportTaskDto toReportTaskDto(ReportTask t) {
        return new ReportTaskDto(t.getId(), t.getTitle(), t.getPriority(),
                t.getPlannedPercent(), t.getActualPercent(), t.getStatus(),
                t.getPlannedHours(), t.getSpentHours(), t.getOutput());
    }

    public static PlannedTaskDto toPlannedTaskDto(PlannedTask t) {
        return new PlannedTaskDto(t.getId(), t.getTitle(), t.getPriority(), t.getPlannedHours());
    }

    public static BlockerDto toBlockerDto(Blocker b) {
        return new BlockerDto(b.getId(), b.getDescription(), b.isKeyIssue());
    }

    public static AchievementDto toAchievementDto(Achievement a) {
        return new AchievementDto(a.getId(), a.getDescription(), a.isKeyAchievement());
    }

    public static ReportLinkDto toReportLinkDto(ReportLink l) {
        return new ReportLinkDto(l.getId(), l.getLabel(), l.getUrl());
    }

    public static ReportVersionDto toVersionDto(ReportVersion v) {
        return new ReportVersionDto(v.getVersionNumber(),
                v.getSubmittedAt() != null ? v.getSubmittedAt().toString() : null,
                v.getStatus(), v.getReviewCommentId());
    }

    public static ReviewCommentDto toReviewCommentDto(ReviewComment c) {
        return new ReviewCommentDto(c.getId(),
                c.getReport() != null ? c.getReport().getId() : null,
                c.getVersionNumber(),
                c.getAuthor() != null ? c.getAuthor().getId() : null,
                c.getMessage(), c.getDecision(),
                c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);
    }
}
