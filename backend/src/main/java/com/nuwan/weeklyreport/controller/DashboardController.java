package com.nuwan.weeklyreport.controller;

import com.nuwan.weeklyreport.dto.response.ActivityItemDto;
import com.nuwan.weeklyreport.dto.response.DashboardDto;
import com.nuwan.weeklyreport.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DashboardDto> getDashboard(
            @RequestParam(required = false) String weekStart,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String memberId,
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) String status) {

        return ResponseEntity.ok(
                dashboardService.getDashboard(weekStart, from, to, memberId, projectId, status));
    }
}
