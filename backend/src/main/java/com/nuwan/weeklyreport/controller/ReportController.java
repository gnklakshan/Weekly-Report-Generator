package com.nuwan.weeklyreport.controller;

import com.nuwan.weeklyreport.dto.request.CreateReportRequest;
import com.nuwan.weeklyreport.dto.response.ReportDto;
import com.nuwan.weeklyreport.dto.request.UpdateReportRequest;
import com.nuwan.weeklyreport.enums.ReportStatus;
import com.nuwan.weeklyreport.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public ResponseEntity<List<ReportDto>> getReports(
            @RequestParam(required = false) String authorId,
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String weekStart,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {

        ReportStatus statusEnum = status != null && !"ALL".equals(status)
                ? ReportStatus.valueOf(status) : null;

        return ResponseEntity.ok(
                reportService.getReports(authorId, projectId, statusEnum, search, weekStart, from, to));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReportDto> getReport(@PathVariable String id) {
        return ResponseEntity.ok(reportService.getReport(id));
    }

    @PostMapping
    public ResponseEntity<ReportDto> createReport(@Valid @RequestBody CreateReportRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reportService.createReport(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReportDto> updateReport(@PathVariable String id,
                                                  @RequestBody UpdateReportRequest request) {
        return ResponseEntity.ok(reportService.updateReport(id, request));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ReportDto> submitReport(@PathVariable String id) {
        return ResponseEntity.ok(reportService.submitReport(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable String id) {
        reportService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }
}
