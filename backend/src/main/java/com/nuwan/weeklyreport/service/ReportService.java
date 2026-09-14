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
import com.nuwan.weeklyreport.service.transformer.ReportTransformer;
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

    public List<ReportResponseDto> getReports(String authorId, String projectId,
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

        return reports.stream().map(ReportTransformer::toDto).collect(Collectors.toList());
    }

    public ReportResponseDto getReport(String id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", id));
        return ReportTransformer.toDto(report);
    }

    @Transactional
    public ReportResponseDto createReport(CreateReportRequest request) {
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
                    .map(t -> ReportTransformer.toReportTaskEntity(t, newReport))
                    .collect(Collectors.toList()));
        }
        if (request.getNextWeekTasks() != null) {
            report.setNextWeekTasks(request.getNextWeekTasks().stream()
                    .map(t -> ReportTransformer.toPlannedTaskEntity(t, newReport))
                    .collect(Collectors.toList()));
        }
        if (request.getBlockers() != null) {
            report.setBlockers(request.getBlockers().stream()
                    .map(b -> ReportTransformer.toBlockerEntity(b, newReport))
                    .collect(Collectors.toList()));
        }
        if (request.getAchievements() != null) {
            report.setAchievements(request.getAchievements().stream()
                    .map(a -> ReportTransformer.toAchievementEntity(a, newReport))
                    .collect(Collectors.toList()));
        }
        if (request.getLinks() != null) {
            report.setLinks(request.getLinks().stream()
                    .map(l -> ReportTransformer.toReportLinkEntity(l, newReport))
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

        return ReportTransformer.toDto(report);
    }

    @Transactional
    public ReportResponseDto updateReport(String id, UpdateReportRequest request) {
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
                    .map(t -> ReportTransformer.toReportTaskEntity(t, existingReport))
                    .toList());
        }
        if (request.getNextWeekTasks() != null) {
            report.getNextWeekTasks().clear();
            report.getNextWeekTasks().addAll(request.getNextWeekTasks().stream()
                    .map(t -> ReportTransformer.toPlannedTaskEntity(t, existingReport))
                    .toList());
        }
        if (request.getBlockers() != null) {
            report.getBlockers().clear();
            report.getBlockers().addAll(request.getBlockers().stream()
                    .map(b -> ReportTransformer.toBlockerEntity(b, existingReport))
                    .toList());
        }
        if (request.getAchievements() != null) {
            report.getAchievements().clear();
            report.getAchievements().addAll(request.getAchievements().stream()
                    .map(a -> ReportTransformer.toAchievementEntity(a, existingReport))
                    .toList());
        }
        if (request.getLinks() != null) {
            report.getLinks().clear();
            report.getLinks().addAll(request.getLinks().stream()
                    .map(l -> ReportTransformer.toReportLinkEntity(l, existingReport))
                    .toList());
        }

        report.setUpdatedAt(LocalDate.now());
        report = reportRepository.save(report);
        return ReportTransformer.toDto(report);
    }

    @Transactional
    public ReportResponseDto submitReport(String id) {
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

//        List<ReportVersion> versions = new ArrayList<>(report.getVersions());
//        versions.add(version);
//        report.setVersions(versions);

        report.getVersions().add(version);


        report = reportRepository.save(report);

        ActivityKind kind = isResubmission ? ActivityKind.REPORT_RESUBMITTED : ActivityKind.REPORT_SUBMITTED;
        String msg = report.getAuthor().getFullName() + " submitted report for "
                + report.getProject().getName();
        logActivity(kind, report.getAuthor(), report, msg);

        return ReportTransformer.toDto(report);
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
}
