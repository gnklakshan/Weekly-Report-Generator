package com.nuwan.weeklyreport.service;

import com.nuwan.weeklyreport.dao.entity.Project;
import com.nuwan.weeklyreport.dao.entity.Report;
import com.nuwan.weeklyreport.dao.entity.ReportTask;
import com.nuwan.weeklyreport.dao.entity.User;
import com.nuwan.weeklyreport.dao.repository.ActivityRepository;
import com.nuwan.weeklyreport.dao.repository.ProjectRepository;
import com.nuwan.weeklyreport.dao.repository.ReportRepository;
import com.nuwan.weeklyreport.dao.repository.UserRepository;
import com.nuwan.weeklyreport.dto.response.*;
import com.nuwan.weeklyreport.enums.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.IsoFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ActivityRepository activityRepository;

    public DashboardService(ReportRepository reportRepository,
                            UserRepository userRepository,
                            ProjectRepository projectRepository,
                            ActivityRepository activityRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.activityRepository = activityRepository;
    }

    public DashboardDto getDashboard(String weekStartStr, String fromStr, String toStr,
                                     String memberId, String projectId, String status) {
        LocalDate requestedWeek = weekStartStr != null
                ? LocalDate.parse(weekStartStr)
                : LocalDate.now().with(java.time.DayOfWeek.MONDAY);
        LocalDate from = fromStr != null ? LocalDate.parse(fromStr) : null;
        LocalDate to = toStr != null ? LocalDate.parse(toStr) : null;

        List<Report> allReports = reportRepository.findFiltered(
                memberId != null && !"ALL".equals(memberId) ? memberId : null,
                projectId != null && !"ALL".equals(projectId) ? projectId : null,
                status != null && !"ALL".equals(status) ? parseReportStatus(status) : null,
                null, from, to);

        // If the requested week has no reports, fall back to the most recent week with data
        List<Report> weekReports = allReports.stream()
                .filter(r -> r.getWeekStart().equals(requestedWeek))
                .toList();
        LocalDate effectiveWeek = requestedWeek;
        if (weekReports.isEmpty() && weekStartStr == null) {
            Optional<LocalDate> latestWeek = allReports.stream()
                    .map(Report::getWeekStart)
                    .distinct()
                    .max(LocalDate::compareTo);
            if (latestWeek.isPresent()) {
                effectiveWeek = latestWeek.get();
                weekReports = allReports.stream()
                        .filter(r -> r.getWeekStart().equals(effectiveWeek))
                        .toList();
            }
        }

        List<User> teamMembers = userRepository.findByRole(UserRole.TEAM_MEMBER);
        if (memberId != null && !"ALL".equals(memberId)) {
            teamMembers = teamMembers.stream()
                    .filter(u -> u.getId().equals(memberId))
                    .collect(Collectors.toList());
        }

        DashboardMetricsDto metrics = computeMetrics(weekReports, teamMembers.size());
        List<TrendPointDto> trend = computeTrend(allReports);
        List<StatusByMemberPointDto> statusByMember = computeStatusByMember(teamMembers, allReports);
        List<ProjectWorkloadSliceDto> workload = computeWorkload(allReports);
        List<TaskTypeSliceDto> taskTypes = computeTaskTypes(allReports);
        List<ActivityItemDto> activity = computeActivity();
        List<TeamMemberStatsDto> teamStats = computeTeamStats(teamMembers, allReports);

        DashboardDto dashboard = new DashboardDto();
        dashboard.setMetrics(metrics);
        dashboard.setTrend(trend);
        dashboard.setStatusByMember(statusByMember);
        dashboard.setWorkloadByProject(workload);
        dashboard.setTimeByTaskType(taskTypes);
        dashboard.setActivity(activity);
        dashboard.setTeamStats(teamStats);
        return dashboard;
    }

    public List<ActivityItemDto> getActivity(int limit) {
        return computeActivity(limit);
    }

    private DashboardMetricsDto computeMetrics(List<Report> weekReports, int expectedCount) {
        int expected = Math.max(expectedCount, 1);
        int submitted = (int) weekReports.stream()
                .filter(r -> r.getStatus() != ReportStatus.DRAFT).count();
        int approved = (int) weekReports.stream()
                .filter(r -> r.getStatus() == ReportStatus.APPROVED).count();
        int needsCorrection = (int) weekReports.stream()
                .filter(r -> r.getStatus() == ReportStatus.NEEDS_CORRECTION).count();

        int blockers = weekReports.stream()
                .mapToInt(r -> r.getBlockers() != null ? r.getBlockers().size() : 0)
                .sum();

        int tasksCompleted = weekReports.stream()
                .flatMap(r -> r.getCompletedTasks() != null ? r.getCompletedTasks().stream() : List.<ReportTask>of().stream())
                .filter(t -> t.getStatus() == TaskStatus.COMPLETED)
                .mapToInt(t -> 1)
                .sum();

        double totalHours = weekReports.stream()
                .flatMap(r -> r.getCompletedTasks() != null ? r.getCompletedTasks().stream() : List.<ReportTask>of().stream())
                .mapToDouble(ReportTask::getSpentHours)
                .sum();

        DashboardMetricsDto metrics = new DashboardMetricsDto();
        metrics.setExpectedReports(expected);
        metrics.setSubmittedReports(submitted);
        metrics.setComplianceRate(Math.round((double) submitted / expected * 100.0));
        metrics.setNeedsCorrection(needsCorrection);
        metrics.setApproved(approved);
        metrics.setOpenBlockers(blockers);
        metrics.setTasksCompleted(tasksCompleted);
        metrics.setTotalHours(totalHours);
        return metrics;
    }

    private List<TrendPointDto> computeTrend(List<Report> reports) {
        Map<LocalDate, List<Report>> byWeek = reports.stream()
                .collect(Collectors.groupingBy(Report::getWeekStart));

        return byWeek.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .limit(8)
                .map(entry -> {
                    LocalDate ws = entry.getKey();
                    List<Report> weekReports = entry.getValue();

                    int tasks = weekReports.stream()
                            .flatMap(r -> r.getCompletedTasks() != null
                                    ? r.getCompletedTasks().stream() : List.<ReportTask>of().stream())
                            .filter(t -> t.getStatus() == TaskStatus.COMPLETED)
                            .mapToInt(t -> 1).sum();

                    double hours = weekReports.stream()
                            .flatMap(r -> r.getCompletedTasks() != null
                                    ? r.getCompletedTasks().stream() : List.<ReportTask>of().stream())
                            .mapToDouble(ReportTask::getSpentHours).sum();

                    int weekNum = ws.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
                    String label = "Week " + weekNum;

                    return new TrendPointDto(label, ws.toString(), tasks, hours);
                })
                .toList();
    }

    private List<StatusByMemberPointDto> computeStatusByMember(List<User> members, List<Report> reports) {
        return members.stream().map(member -> {
            List<Report> memberReports = reports.stream()
                    .filter(r -> r.getAuthor() != null && r.getAuthor().getId().equals(member.getId()))
                    .toList();

            int draft = (int) memberReports.stream()
                    .filter(r -> r.getStatus() == ReportStatus.DRAFT).count();
            int submitted = (int) memberReports.stream()
                    .filter(r -> r.getStatus() == ReportStatus.SUBMITTED).count();
            int needsCorrection = (int) memberReports.stream()
                    .filter(r -> r.getStatus() == ReportStatus.NEEDS_CORRECTION).count();
            int approved = (int) memberReports.stream()
                    .filter(r -> r.getStatus() == ReportStatus.APPROVED).count();

            return new StatusByMemberPointDto(member.getId(), member.getFullName(),
                    draft, submitted, needsCorrection, approved);
        }).toList();
    }

    private List<ProjectWorkloadSliceDto> computeWorkload(List<Report> reports) {
        Map<String, List<Report>> byProject = reports.stream()
                .filter(r -> r.getProject() != null)
                .collect(Collectors.groupingBy(r -> r.getProject().getId()));

        return byProject.entrySet().stream().map(entry -> {
            List<Report> projectReports = entry.getValue();
            Project project = projectReports.get(0).getProject();

            double hours = projectReports.stream()
                    .flatMap(r -> r.getCompletedTasks() != null
                            ? r.getCompletedTasks().stream() : List.<ReportTask>of().stream())
                    .mapToDouble(ReportTask::getSpentHours).sum();

            return new ProjectWorkloadSliceDto(
                    project.getId(), project.getName(), project.getColorToken(),
                    hours, projectReports.size());
        }).toList();
    }

    private List<TaskTypeSliceDto> computeTaskTypes(List<Report> reports) {
        Map<TaskType, Double> totals = new EnumMap<>(TaskType.class);
        for (TaskType type : TaskType.values()) {
            totals.put(type, 0.0);
        }

        for (Report report : reports) {
            if (report.getHours() != null) {
                report.getHours().forEach((type, hours) ->
                        totals.merge(type, hours, Double::sum));
            }
        }

        return totals.entrySet().stream()
                .map(e -> new TaskTypeSliceDto(e.getKey(),
                        e.getKey().name().toLowerCase().replace("_", " "),
                        e.getValue()))
                .toList();
    }

    private List<ActivityItemDto> computeActivity() {
        return computeActivity(10);
    }

    private List<ActivityItemDto> computeActivity(int limit) {
        return activityRepository.findRecent(limit).stream()
                .map(a -> new ActivityItemDto(
                        a.getId(), a.getKind(),
                        a.getActor() != null ? a.getActor().getId() : null,
                        a.getActor() != null ? a.getActor().getFullName() : null,
                        a.getReport() != null ? a.getReport().getId() : null,
                        a.getMessage(),
                        a.getCreatedAt() != null ? a.getCreatedAt().toString() : null))
                .toList();
    }

    private List<TeamMemberStatsDto> computeTeamStats(List<User> members, List<Report> allReports) {
        LocalDate currentWeekStart = LocalDate.now().with(java.time.DayOfWeek.MONDAY);

        return members.stream().map(member -> {
            List<Report> memberReports = allReports.stream()
                    .filter(r -> r.getAuthor() != null && r.getAuthor().getId().equals(member.getId()))
                    .toList();

            Report currentWeekReport = memberReports.stream()
                    .filter(r -> r.getWeekStart().equals(currentWeekStart))
                    .findFirst().orElse(null);

            String weekStatus = currentWeekReport != null
                    ? currentWeekReport.getStatus().name()
                    : "NOT_STARTED";

            int submitted = (int) memberReports.stream()
                    .filter(r -> r.getStatus() != ReportStatus.DRAFT).count();
            int approved = (int) memberReports.stream()
                    .filter(r -> r.getStatus() == ReportStatus.APPROVED).count();
            double approvalRate = submitted > 0
                    ? Math.round((double) approved / submitted * 100.0)
                    : 0;

            int tasksCompleted = memberReports.stream()
                    .flatMap(r -> r.getCompletedTasks() != null
                            ? r.getCompletedTasks().stream() : List.<ReportTask>of().stream())
                    .filter(t -> t.getStatus() == TaskStatus.COMPLETED)
                    .mapToInt(t -> 1).sum();

            double hours = memberReports.stream()
                    .flatMap(r -> r.getCompletedTasks() != null
                            ? r.getCompletedTasks().stream() : List.<ReportTask>of().stream())
                    .mapToDouble(ReportTask::getSpentHours).sum();

            int blockers = memberReports.stream()
                    .mapToInt(r -> r.getBlockers() != null ? r.getBlockers().size() : 0).sum();

            double avgHours = memberReports.isEmpty() ? 0 : hours / memberReports.size();

            return new TeamMemberStatsDto(
                    member.getId(), member.getFullName(), member.getJobTitle(),
                    weekStatus, submitted, approvalRate, tasksCompleted,
                    hours, blockers, avgHours);
        }).toList();
    }

    private ReportStatus parseReportStatus(String status) {
        try {
            return ReportStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
