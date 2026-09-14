package com.nuwan.weeklyreport.service;

import com.nuwan.weeklyreport.dao.repository.ActivityRepository;
import com.nuwan.weeklyreport.dao.repository.ReportRepository;
import com.nuwan.weeklyreport.dao.repository.ReviewCommentRepository;
import com.nuwan.weeklyreport.dao.repository.UserRepository;
import com.nuwan.weeklyreport.dto.request.ApproveReviewRequest;
import com.nuwan.weeklyreport.dto.response.ReportResponseDto;
import com.nuwan.weeklyreport.dto.request.RequestCorrectionRequest;
import com.nuwan.weeklyreport.dto.response.ReviewQueueItemDto;
import com.nuwan.weeklyreport.dao.entity.Activity;
import com.nuwan.weeklyreport.dao.entity.Report;
import com.nuwan.weeklyreport.dao.entity.ReviewComment;
import com.nuwan.weeklyreport.dao.entity.User;
import com.nuwan.weeklyreport.enums.ActivityKind;
import com.nuwan.weeklyreport.enums.ReportStatus;
import com.nuwan.weeklyreport.enums.ReviewDecision;
import com.nuwan.weeklyreport.exception.ApiException;
import com.nuwan.weeklyreport.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ReviewService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ReviewCommentRepository reviewCommentRepository;
    private final ActivityRepository activityRepository;
    private final ReportService reportService;

    public ReviewService(ReportRepository reportRepository,
                         UserRepository userRepository,
                         ReviewCommentRepository reviewCommentRepository,
                         ActivityRepository activityRepository,
                         ReportService reportService) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.reviewCommentRepository = reviewCommentRepository;
        this.activityRepository = activityRepository;
        this.reportService = reportService;
    }

    public List<ReviewQueueItemDto> getReviewQueue(String reviewerId) {
        List<Report> submitted = reportRepository.findSubmittedReports(ReportStatus.SUBMITTED);

        return submitted.stream()
                .map(report -> {
                    double hours = 0;
                    if (report.getSubmittedAt() != null) {
                        hours = ChronoUnit.HOURS.between(
                                report.getSubmittedAt().atStartOfDay(),
                                LocalDate.now().atStartOfDay());
                    }

                    ReportResponseDto reportResponseDto = reportService.getReport(report.getId());

                    return new ReviewQueueItemDto(
                            reportResponseDto,
                            report.getAuthor() != null ? report.getAuthor().getFullName() : "",
                            report.getProject() != null ? report.getProject().getName() : "",
                            hours);
                })
                .sorted((a, b) -> Double.compare(b.getWaitingSinceHours(), a.getWaitingSinceHours()))
                .toList();
    }

    @Transactional
    public ReportResponseDto approveReport(ApproveReviewRequest request) {
        Report report = reportRepository.findById(request.getReportId())
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", request.getReportId()));

        if (report.getStatus() != ReportStatus.SUBMITTED) {
            throw new ApiException("Report is not in SUBMITTED status", HttpStatus.BAD_REQUEST);
        }

        User reviewer = userRepository.findById(request.getReviewerId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getReviewerId()));

        report.setStatus(ReportStatus.APPROVED);
        report.setReviewedBy(reviewer);
        report.setReviewedAt(LocalDate.now());
        report.setUpdatedAt(LocalDate.now());

        ReviewComment comment = new ReviewComment();
        comment.setId(UUID.randomUUID().toString());
        comment.setReport(report);
        comment.setVersionNumber(report.getCurrentVersion());
        comment.setAuthor(reviewer);
        comment.setMessage(request.getMessage() != null ? request.getMessage() : "Approved");
        comment.setDecision(ReviewDecision.APPROVED);
        comment.setCreatedAt(LocalDate.now());

        List<ReviewComment> comments = new ArrayList<>(report.getReviewComments());
        comments.add(comment);
        report.setReviewComments(comments);

        report = reportRepository.save(report);

        Activity activity = new Activity();
        activity.setId(UUID.randomUUID().toString());
        activity.setKind(ActivityKind.REPORT_APPROVED);
        activity.setActor(reviewer);
        activity.setReport(report);
        activity.setMessage(reviewer.getFullName() + " approved report for "
                + report.getProject().getName());
        activity.setCreatedAt(LocalDateTime.now());
        activityRepository.save(activity);

        return reportService.getReport(report.getId());
    }

    @Transactional
    public ReportResponseDto requestCorrection(RequestCorrectionRequest request) {
        Report report = reportRepository.findById(request.getReportId())
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", request.getReportId()));

        if (report.getStatus() != ReportStatus.SUBMITTED) {
            throw new ApiException("Report is not in SUBMITTED status", HttpStatus.BAD_REQUEST);
        }

        User reviewer = userRepository.findById(request.getReviewerId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getReviewerId()));

        report.setStatus(ReportStatus.NEEDS_CORRECTION);
        report.setReviewedBy(reviewer);
        report.setReviewedAt(LocalDate.now());
        report.setUpdatedAt(LocalDate.now());

        ReviewComment comment = new ReviewComment();
        comment.setId(UUID.randomUUID().toString());
        comment.setReport(report);
        comment.setVersionNumber(report.getCurrentVersion());
        comment.setAuthor(reviewer);
        comment.setMessage(request.getMessage());
        comment.setDecision(ReviewDecision.CHANGES_REQUESTED);
        comment.setCreatedAt(LocalDate.now());

        List<ReviewComment> comments = new ArrayList<>(report.getReviewComments());
        comments.add(comment);
        report.setReviewComments(comments);

        report = reportRepository.save(report);

        Activity activity = new Activity();
        activity.setId(UUID.randomUUID().toString());
        activity.setKind(ActivityKind.CORRECTION_REQUESTED);
        activity.setActor(reviewer);
        activity.setReport(report);
        activity.setMessage(reviewer.getFullName() + " requested correction for "
                + report.getProject().getName());
        activity.setCreatedAt(LocalDateTime.now());
        activityRepository.save(activity);

        return reportService.getReport(report.getId());
    }
}
