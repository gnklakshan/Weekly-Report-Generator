package com.nuwan.weeklyreport.service;

import com.nuwan.weeklyreport.dao.entity.*;
import com.nuwan.weeklyreport.dao.repository.ActivityRepository;
import com.nuwan.weeklyreport.dao.repository.ProjectRepository;
import com.nuwan.weeklyreport.dao.repository.ReportRepository;
import com.nuwan.weeklyreport.dao.repository.UserRepository;
import com.nuwan.weeklyreport.dto.request.CreateReportRequest;
import com.nuwan.weeklyreport.dto.request.UpdateReportRequest;
import com.nuwan.weeklyreport.dto.response.*;
import com.nuwan.weeklyreport.enums.*;
import com.nuwan.weeklyreport.exception.ApiException;
import com.nuwan.weeklyreport.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ActivityRepository activityRepository;

    public ReportService(ReportRepository reportRepository,
                         UserRepository userRepository,
                         ProjectRepository projectRepository,
                         ActivityRepository activityRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.activityRepository = activityRepository;
    }

    public List<ReportDto> getReports(String authorId, String projectId,
                                      ReportStatus status, String search,
                                      String weekStart, String from, String to) {
        LocalDate ws = weekStart != null ? LocalDate.parse(weekStart) : null;
        LocalDate f = from != null ? LocalDate.parse(from) : null;
        LocalDate t = to != null ? LocalDate.parse(to) : null;
        String pid = "ALL".equals(projectId) ? null : projectId;

        List<Report> reports = reportRepository.findFiltered(authorId, pid, status, ws, f, t);

        if (search != null && !search.isBlank()) {
            String lower = search.toLowerCase();
            reports = reports.stream()
                    .filter(r -> matchesSearch(r, lower))
                    .collect(Collectors.toList());
        }

        return reports.stream().map(this::toDto).collect(Collectors.toList());
    }

    public ReportDto getReport(String id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", id));
        return toDto(report);
    }

    @Transactional
    public ReportDto createReport(CreateReportRequest request) {
        User author = userRepository.findById(request.getAuthorId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAuthorId()));
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));

        Report report = new Report();
        report.setId(UUID.randomUUID().toString());
        report.setAuthor(author);
        report.setProject(project);
        report.setWeekStart(LocalDate.parse(request.getWeekStart()));
        report.setWeekEnd(LocalDate.parse(request.getWeekEnd()));
        report.setStatus(ReportStatus.DRAFT);
        report.setCurrentVersion(1);
        report.setNotes(request.getNotes() != null ? request.getNotes() : "");
        report.setCreatedAt(LocalDate.now());
        report.setUpdatedAt(LocalDate.now());

        report.setHours(request.getHours() != null ? request.getHours() : new HashMap<>());

        final Report newReport = report;

        if (request.getCompletedTasks() != null) {
            report.setCompletedTasks(request.getCompletedTasks().stream()
                    .map(t -> toReportTaskEntity(t, newReport))
                    .collect(Collectors.toList()));
        }
        if (request.getNextWeekTasks() != null) {
            report.setNextWeekTasks(request.getNextWeekTasks().stream()
                    .map(t -> toPlannedTaskEntity(t, newReport))
                    .collect(Collectors.toList()));
        }
        if (request.getBlockers() != null) {
            report.setBlockers(request.getBlockers().stream()
                    .map(b -> toBlockerEntity(b, newReport))
                    .collect(Collectors.toList()));
        }
        if (request.getAchievements() != null) {
            report.setAchievements(request.getAchievements().stream()
                    .map(a -> toAchievementEntity(a, newReport))
                    .collect(Collectors.toList()));
        }
        if (request.getLinks() != null) {
            report.setLinks(request.getLinks().stream()
                    .map(l -> toReportLinkEntity(l, newReport))
                    .collect(Collectors.toList()));
        }

        ReportVersion version = new ReportVersion();
        version.setId(UUID.randomUUID().toString());
        version.setReport(report);
        version.setVersionNumber(1);
        version.setSubmittedAt(LocalDate.now());
        version.setStatus(ReportStatus.DRAFT);
        report.setVersions(List.of(version));

        report = reportRepository.save(report);

        logActivity(ActivityKind.DRAFT_CREATED, author, report,
                author.getFullName() + " created a draft report for " + project.getName());

        return toDto(report);
    }

    @Transactional
    public ReportDto updateReport(String id, UpdateReportRequest request) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", id));

        if (report.getStatus() != ReportStatus.DRAFT
                && report.getStatus() != ReportStatus.NEEDS_CORRECTION) {
            throw new ApiException("Cannot edit report in " + report.getStatus() + " status",
                    HttpStatus.BAD_REQUEST);
        }

        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));
            report.setProject(project);
        }
        if (request.getWeekStart() != null) report.setWeekStart(LocalDate.parse(request.getWeekStart()));
        if (request.getWeekEnd() != null) report.setWeekEnd(LocalDate.parse(request.getWeekEnd()));
        if (request.getNotes() != null) report.setNotes(request.getNotes());
        if (request.getHours() != null) report.setHours(request.getHours());

        final Report existingReport = report;

        if (request.getCompletedTasks() != null) {
            report.getCompletedTasks().clear();
            report.getCompletedTasks().addAll(request.getCompletedTasks().stream()
                    .map(t -> toReportTaskEntity(t, existingReport))
                    .toList());
        }
        if (request.getNextWeekTasks() != null) {
            report.getNextWeekTasks().clear();
            report.getNextWeekTasks().addAll(request.getNextWeekTasks().stream()
                    .map(t -> toPlannedTaskEntity(t, existingReport))
                    .toList());
        }
        if (request.getBlockers() != null) {
            report.getBlockers().clear();
            report.getBlockers().addAll(request.getBlockers().stream()
                    .map(b -> toBlockerEntity(b, existingReport))
                    .toList());
        }
        if (request.getAchievements() != null) {
            report.getAchievements().clear();
            report.getAchievements().addAll(request.getAchievements().stream()
                    .map(a -> toAchievementEntity(a, existingReport))
                    .toList());
        }
        if (request.getLinks() != null) {
            report.getLinks().clear();
            report.getLinks().addAll(request.getLinks().stream()
                    .map(l -> toReportLinkEntity(l, existingReport))
                    .toList());
        }

        report.setUpdatedAt(LocalDate.now());
        report = reportRepository.save(report);
        return toDto(report);
    }

    @Transactional
    public ReportDto submitReport(String id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", id));

        boolean isResubmission = report.getStatus() == ReportStatus.NEEDS_CORRECTION;

        report.setStatus(ReportStatus.SUBMITTED);
        report.setCurrentVersion(report.getCurrentVersion() + 1);
        report.setSubmittedAt(LocalDate.now());
        report.setReviewedAt(null);
        report.setReviewedBy(null);
        report.setUpdatedAt(LocalDate.now());

        ReportVersion version = new ReportVersion();
        version.setId(UUID.randomUUID().toString());
        version.setReport(report);
        version.setVersionNumber(report.getCurrentVersion());
        version.setSubmittedAt(LocalDate.now());
        version.setStatus(ReportStatus.SUBMITTED);

        List<ReportVersion> versions = new ArrayList<>(report.getVersions());
        versions.add(version);
        report.setVersions(versions);

        report = reportRepository.save(report);

        ActivityKind kind = isResubmission ? ActivityKind.REPORT_RESUBMITTED : ActivityKind.REPORT_SUBMITTED;
        String msg = report.getAuthor().getFullName() + " submitted report for "
                + report.getProject().getName();
        logActivity(kind, report.getAuthor(), report, msg);

        return toDto(report);
    }

    @Transactional
    public void deleteReport(String id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", id));
        reportRepository.delete(report);
    }

    private void logActivity(ActivityKind kind, User actor, Report report, String message) {
        Activity activity = new Activity();
        activity.setId(UUID.randomUUID().toString());
        activity.setKind(kind);
        activity.setActor(actor);
        activity.setReport(report);
        activity.setMessage(message);
        activity.setCreatedAt(LocalDateTime.now());
        activityRepository.save(activity);
    }

    private boolean matchesSearch(Report report, String search) {
        if (report.getNotes() != null && report.getNotes().toLowerCase().contains(search)) return true;
        if (report.getCompletedTasks() != null && report.getCompletedTasks().stream()
                .anyMatch(t -> (t.getTitle() != null && t.getTitle().toLowerCase().contains(search))
                        || (t.getOutput() != null && t.getOutput().toLowerCase().contains(search)))) return true;
        if (report.getAchievements() != null && report.getAchievements().stream()
                .anyMatch(a -> a.getDescription() != null && a.getDescription().toLowerCase().contains(search))) return true;
        if (report.getBlockers() != null && report.getBlockers().stream()
                .anyMatch(b -> b.getDescription() != null && b.getDescription().toLowerCase().contains(search))) return true;
        return false;
    }

    private ReportTask toReportTaskEntity(ReportTaskDto dto, Report report) {
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

    private PlannedTask toPlannedTaskEntity(PlannedTaskDto dto, Report report) {
        PlannedTask task = new PlannedTask();
        task.setId(dto.getId() != null ? dto.getId() : UUID.randomUUID().toString());
        task.setReport(report);
        task.setTitle(dto.getTitle());
        task.setPriority(dto.getPriority());
        task.setPlannedHours(dto.getPlannedHours());
        return task;
    }

    private Blocker toBlockerEntity(BlockerDto dto, Report report) {
        Blocker blocker = new Blocker();
        blocker.setId(dto.getId() != null ? dto.getId() : UUID.randomUUID().toString());
        blocker.setReport(report);
        blocker.setDescription(dto.getDescription());
        blocker.setKeyIssue(dto.getKeyIssue() != null ? dto.getKeyIssue() : false);
        return blocker;
    }

    private Achievement toAchievementEntity(AchievementDto dto, Report report) {
        Achievement achievement = new Achievement();
        achievement.setId(dto.getId() != null ? dto.getId() : UUID.randomUUID().toString());
        achievement.setReport(report);
        achievement.setDescription(dto.getDescription());
        achievement.setKeyAchievement(dto.getKeyAchievement() != null ? dto.getKeyAchievement() : false);
        return achievement;
    }

    private ReportLink toReportLinkEntity(ReportLinkDto dto, Report report) {
        ReportLink link = new ReportLink();
        link.setId(dto.getId() != null ? dto.getId() : UUID.randomUUID().toString());
        link.setReport(report);
        link.setLabel(dto.getLabel());
        link.setUrl(dto.getUrl());
        return link;
    }

    private ReportDto toDto(Report report) {
        ReportDto dto = new ReportDto();
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
                ? report.getCompletedTasks().stream().map(this::toReportTaskDto).toList()
                : List.of());
        dto.setNextWeekTasks(report.getNextWeekTasks() != null
                ? report.getNextWeekTasks().stream().map(this::toPlannedTaskDto).toList()
                : List.of());
        dto.setBlockers(report.getBlockers() != null
                ? report.getBlockers().stream().map(this::toBlockerDto).toList()
                : List.of());
        dto.setAchievements(report.getAchievements() != null
                ? report.getAchievements().stream().map(this::toAchievementDto).toList()
                : List.of());
        dto.setLinks(report.getLinks() != null
                ? report.getLinks().stream().map(this::toReportLinkDto).toList()
                : List.of());
        dto.setVersions(report.getVersions() != null
                ? report.getVersions().stream().map(this::toVersionDto).toList()
                : List.of());
        dto.setReviewComments(report.getReviewComments() != null
                ? report.getReviewComments().stream().map(this::toReviewCommentDto).toList()
                : List.of());

        return dto;
    }

    private ReportTaskDto toReportTaskDto(ReportTask t) {
        return new ReportTaskDto(t.getId(), t.getTitle(), t.getPriority(),
                t.getPlannedPercent(), t.getActualPercent(), t.getStatus(),
                t.getPlannedHours(), t.getSpentHours(), t.getOutput());
    }

    private PlannedTaskDto toPlannedTaskDto(PlannedTask t) {
        return new PlannedTaskDto(t.getId(), t.getTitle(), t.getPriority(), t.getPlannedHours());
    }

    private BlockerDto toBlockerDto(Blocker b) {
        return new BlockerDto(b.getId(), b.getDescription(), b.isKeyIssue());
    }

    private AchievementDto toAchievementDto(Achievement a) {
        return new AchievementDto(a.getId(), a.getDescription(), a.isKeyAchievement());
    }

    private ReportLinkDto toReportLinkDto(ReportLink l) {
        return new ReportLinkDto(l.getId(), l.getLabel(), l.getUrl());
    }

    private ReportVersionDto toVersionDto(ReportVersion v) {
        return new ReportVersionDto(v.getVersionNumber(),
                v.getSubmittedAt() != null ? v.getSubmittedAt().toString() : null,
                v.getStatus(), v.getReviewCommentId());
    }

    private ReviewCommentDto toReviewCommentDto(ReviewComment c) {
        return new ReviewCommentDto(c.getId(),
                c.getReport() != null ? c.getReport().getId() : null,
                c.getVersionNumber(),
                c.getAuthor() != null ? c.getAuthor().getId() : null,
                c.getMessage(), c.getDecision(),
                c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);
    }
}
