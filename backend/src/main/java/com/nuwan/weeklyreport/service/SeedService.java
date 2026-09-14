package com.nuwan.weeklyreport.service;

import com.nuwan.weeklyreport.dao.entity.*;
import com.nuwan.weeklyreport.dao.repository.*;
import com.nuwan.weeklyreport.enums.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * On-demand seed service. Call {@link #seed()} to populate the database with
 * demo users, projects, reports, and activities.
 * Safe to call multiple times — skips seeding if users already exist.
 */
@Service
public class SeedService {

    private static final String DEMO_PASSWORD = "password123";

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ReportRepository reportRepository;
    private final ActivityRepository activityRepository;
    private final PasswordEncoder passwordEncoder;

    public SeedService(UserRepository userRepository,
                       ProjectRepository projectRepository,
                       ReportRepository reportRepository,
                       ActivityRepository activityRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.reportRepository = reportRepository;
        this.activityRepository = activityRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Map<String, Object> seed() {
        if (userRepository.count() > 0) {
            return Map.of(
                    "seeded", false,
                    "message", "Database already contains users. Clear the database first or use as-is."
            );
        }

        String encoded = passwordEncoder.encode(DEMO_PASSWORD);

        // ── Users ──────────────────────────────────────────────
        User admin = createUser("u_admin", "Nuwan Admin",
                "admin@example.com", encoded, UserRole.ADMIN, "System Administrator");

        User manager = createUser("u_manager", "Sarah Manager",
                "manager@example.com", encoded, UserRole.ADMIN, "Project Manager");

        User member1 = createUser("u_member1", "Daniel Perera",
                "daniel@example.com", encoded, UserRole.TEAM_MEMBER, "Software Engineer");
        member1.setManager(manager);
        userRepository.save(member1);

        User member2 = createUser("u_member2", "Nethmi Silva",
                "nethmi@example.com", encoded, UserRole.TEAM_MEMBER, "QA Engineer");
        member2.setManager(manager);
        userRepository.save(member2);

        User member3 = createUser("u_member3", "Kavindu Jay",
                "kavindu@example.com", encoded, UserRole.TEAM_MEMBER, "Frontend Developer");
        member3.setManager(manager);
        userRepository.save(member3);

        User member4 = createUser("u_member4", "Team Member",
                "member@example.com", encoded, UserRole.TEAM_MEMBER, "Full Stack Developer");
        member4.setManager(manager);
        userRepository.save(member4);

        // ── Projects ───────────────────────────────────────────
        Project p1 = createProject("p1", "E-Commerce Platform",
                "Online shopping platform with payment integration",
                ProjectStatus.ACTIVE, "chart-1", Set.of(member1, member2, member3));

        Project p2 = createProject("p2", "Mobile Banking App",
                "Cross-platform mobile banking application",
                ProjectStatus.ACTIVE, "chart-2", Set.of(member1, member4));

        Project p3 = createProject("p3", "HR Management System",
                "Internal HR portal for leave and attendance",
                ProjectStatus.ON_HOLD, "chart-3", Set.of(member2, member3));

        Project p4 = createProject("p4", "Analytics Dashboard",
                "Real-time business analytics and reporting tool",
                ProjectStatus.ACTIVE, "chart-4", Set.of(member1, member2, member3, member4));

        // ── Reports across several weeks ───────────────────────
        LocalDate currentWeek = LocalDate.now().with(java.time.DayOfWeek.MONDAY);
        LocalDate lastWeek = currentWeek.minusWeeks(1);
        LocalDate twoWeeksAgo = currentWeek.minusWeeks(2);
        LocalDate threeWeeksAgo = currentWeek.minusWeeks(3);

        // Week -3: approved report
        Report r0 = createReport(member1, p1, threeWeeksAgo,
                ReportStatus.APPROVED, manager);

        // Week -2: mixed statuses
        Report r0b = createReport(member2, p1, twoWeeksAgo,
                ReportStatus.APPROVED, manager);
        Report r0c = createReport(member3, p3, twoWeeksAgo,
                ReportStatus.SUBMITTED, null);

        // Week -1: mixed statuses
        Report r1 = createReport(member1, p1, lastWeek,
                ReportStatus.APPROVED, manager);
        Report r2 = createReport(member2, p1, lastWeek,
                ReportStatus.SUBMITTED, null);
        Report r3 = createReport(member3, p3, lastWeek,
                ReportStatus.DRAFT, null);
        Report r3b = createReport(member4, p2, lastWeek,
                ReportStatus.NEEDS_CORRECTION, manager);

        // Current week: in progress
        Report r4 = createReport(member4, p2, currentWeek,
                ReportStatus.DRAFT, null);

        // ── Activities ─────────────────────────────────────────
        createActivity(ActivityKind.REPORT_APPROVED, manager, r1,
                manager.getFullName() + " approved report for " + p1.getName());
        createActivity(ActivityKind.REPORT_SUBMITTED, member2, r2,
                member2.getFullName() + " submitted report for " + p1.getName());
        createActivity(ActivityKind.CORRECTION_REQUESTED, manager, r3b,
                manager.getFullName() + " requested correction for " + p2.getName());
        createActivity(ActivityKind.DRAFT_CREATED, member3, r3,
                member3.getFullName() + " created a draft report for " + p3.getName());
        createActivity(ActivityKind.DRAFT_CREATED, member4, r4,
                member4.getFullName() + " created a draft report for " + p2.getName());

        return Map.of(
                "seeded", true,
                "message", "Demo data seeded successfully.",
                "users", 6,
                "projects", 4,
                "reports", 9,
                "activities", 5
        );
    }

    // ── Helpers ────────────────────────────────────────────────

    private User createUser(String id, String name, String email,
                            String password, UserRole role, String title) {
        User user = new User();
        user.setId(id);
        user.setFullName(name);
        user.setEmail(email);
        user.setPassword(password);
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        user.setJobTitle(title);
        user.setJoinedAt(LocalDate.now().minusMonths(6));
        user.setProjects(new HashSet<>());
        user.setDirectReports(new ArrayList<>());
        return userRepository.save(user);
    }

    private Project createProject(String id, String name, String description,
                                  ProjectStatus status, String colorToken, Set<User> members) {
        Project project = new Project();
        project.setId(id);
        project.setName(name);
        project.setDescription(description);
        project.setStatus(status);
        project.setColorToken(colorToken);
        project.setCreatedAt(LocalDate.now().minusMonths(3));
        project.setMembers(members);
        return projectRepository.save(project);
    }

    private Report createReport(User author, Project project,
                                LocalDate weekStart, ReportStatus status, User reviewer) {
        Report report = new Report();
        report.setId(UUID.randomUUID().toString());
        report.setAuthor(author);
        report.setProject(project);
        report.setWeekStart(weekStart);
        report.setWeekEnd(weekStart.plusDays(6));
        report.setStatus(status);
        report.setCurrentVersion(1);
        report.setNotes("Weekly progress notes");
        report.setCreatedAt(weekStart);
        report.setUpdatedAt(weekStart);

        Map<TaskType, Double> hours = new HashMap<>();
        hours.put(TaskType.DEVELOPMENT, 20.0);
        hours.put(TaskType.TESTING, 8.0);
        hours.put(TaskType.MEETINGS, 5.0);
        hours.put(TaskType.DOCUMENTATION, 3.0);
        hours.put(TaskType.OTHER, 2.0);
        report.setHours(hours);

        ReportTask task = new ReportTask();
        task.setId(UUID.randomUUID().toString());
        task.setReport(report);
        task.setTitle("Complete feature implementation");
        task.setPriority(Priority.HIGH);
        task.setPlannedPercent(100);
        task.setActualPercent(85);
        task.setStatus(TaskStatus.COMPLETED);
        task.setPlannedHours(16);
        task.setSpentHours(14);
        task.setOutput("Feature module completed with unit tests");
        report.setCompletedTasks(new ArrayList<>(List.of(task)));

        PlannedTask planned = new PlannedTask();
        planned.setId(UUID.randomUUID().toString());
        planned.setReport(report);
        planned.setTitle("Code review and integration testing");
        planned.setPriority(Priority.MEDIUM);
        planned.setPlannedHours(10);
        report.setNextWeekTasks(new ArrayList<>(List.of(planned)));

        Blocker blocker = new Blocker();
        blocker.setId(UUID.randomUUID().toString());
        blocker.setReport(report);
        blocker.setDescription("Waiting for API documentation from external team");
        blocker.setKeyIssue(true);
        report.setBlockers(new ArrayList<>(List.of(blocker)));

        Achievement achievement = new Achievement();
        achievement.setId(UUID.randomUUID().toString());
        achievement.setReport(report);
        achievement.setDescription("Reduced page load time by 40%");
        achievement.setKeyAchievement(true);
        report.setAchievements(new ArrayList<>(List.of(achievement)));

        if (status == ReportStatus.SUBMITTED || status == ReportStatus.APPROVED) {
            report.setSubmittedAt(weekStart.plusDays(4));
        }
        if (status == ReportStatus.APPROVED && reviewer != null) {
            report.setReviewedBy(reviewer);
            report.setReviewedAt(weekStart.plusDays(5));
        }
        if (status == ReportStatus.NEEDS_CORRECTION && reviewer != null) {
            report.setReviewedBy(reviewer);
            report.setReviewedAt(weekStart.plusDays(3));
            report.setSubmittedAt(weekStart.plusDays(2));
        }

        report.setVersions(new ArrayList<>());
        report.setReviewComments(new ArrayList<>());

        return reportRepository.save(report);
    }

    private void createActivity(ActivityKind kind, User actor, Report report, String message) {
        Activity activity = new Activity();
        activity.setId(UUID.randomUUID().toString());
        activity.setKind(kind);
        activity.setActor(actor);
        activity.setReport(report);
        activity.setMessage(message);
        activity.setCreatedAt(LocalDateTime.now().minusDays(
                Math.round(Math.random() * 7)));
        activityRepository.save(activity);
    }
}
