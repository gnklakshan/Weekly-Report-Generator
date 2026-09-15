package com.nuwan.weeklyreport.controller;

import com.nuwan.weeklyreport.config.SecurityHelper;
import com.nuwan.weeklyreport.dto.request.CreateReportRequest;
import com.nuwan.weeklyreport.dto.response.PageResponseDto;
import com.nuwan.weeklyreport.dto.response.ReportResponseDto;
import com.nuwan.weeklyreport.dto.request.UpdateReportRequest;
import com.nuwan.weeklyreport.enums.ReportStatus;
import com.nuwan.weeklyreport.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final SecurityHelper security;

    public ReportController(ReportService reportService, SecurityHelper security) {
        this.reportService = reportService;
        this.security = security;
    }

    @PostMapping
    public ResponseEntity<ReportResponseDto> createReport(@Valid @RequestBody CreateReportRequest request) {
        // Team members can only create reports under their own ID
        security.requireOwnerOrAdmin(request.getAuthorId());
        return ResponseEntity.status(HttpStatus.CREATED).body(reportService.createReport(request));
    }

    @GetMapping
    public ResponseEntity<?> getReports(
            @RequestParam(required = false) String authorId,
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String weekStart,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {

        // Team members can only see their own reports — force authorId scoping
        if (!security.isAdmin()) {
            authorId = security.getCurrentUserId();
        }

        ReportStatus statusEnum = status != null && !"ALL".equals(status)
                ? ReportStatus.valueOf(status) : null;

        // DRAFT reports are only visible to their author (the team member).
        // When an admin views the team-wide list (no authorId, no explicit status),
        // exclude DRAFTs so only submitted/approved/correction-needed reports appear.
        boolean excludeDrafts = security.isAdmin() && authorId == null && statusEnum == null;

        // If page and size are provided, return paginated response
        if (page != null && size != null) {
            PageResponseDto<ReportResponseDto> paginated = reportService.getReportsPaginated(
                    authorId, projectId, statusEnum, search, weekStart, from, to, page, size, excludeDrafts);
            return ResponseEntity.ok(paginated);
        }

        // Otherwise, return the full list (backward compatible)
        return ResponseEntity.ok(
                reportService.getReports(authorId, projectId, statusEnum, search, weekStart, from, to, excludeDrafts));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReportResponseDto> getReport(@PathVariable String id) {
        ReportResponseDto report = reportService.getReport(id);
        // Team members can only view their own reports; managers can view any
        security.requireOwnerOrAdmin(report.getAuthorId());
        return ResponseEntity.ok(report);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReportResponseDto> updateReport(@PathVariable String id,
                                                          @RequestBody UpdateReportRequest request) {
        // Only the report owner or an admin can edit
        ReportResponseDto existing = reportService.getReport(id);
        security.requireOwnerOrAdmin(existing.getAuthorId());
        return ResponseEntity.ok(reportService.updateReport(id, request));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ReportResponseDto> submitReport(@PathVariable String id) {
        // Only the report owner or an admin can submit
        ReportResponseDto existing = reportService.getReport(id);
        security.requireOwnerOrAdmin(existing.getAuthorId());
        return ResponseEntity.ok(reportService.submitReport(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable String id) {
        // Only the report owner or an admin can delete
        ReportResponseDto existing = reportService.getReport(id);
        security.requireOwnerOrAdmin(existing.getAuthorId());
        reportService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }
}
