package com.nuwan.weeklyreport.controller;

import com.nuwan.weeklyreport.config.SecurityHelper;
import com.nuwan.weeklyreport.dto.response.DashboardDto;
import com.nuwan.weeklyreport.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final SecurityHelper security;

    public DashboardController(DashboardService dashboardService, SecurityHelper security) {
        this.dashboardService = dashboardService;
        this.security = security;
    }

    @GetMapping
    public ResponseEntity<DashboardDto> getDashboard(
            @RequestParam(required = false) String weekStart,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String memberId,
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) String status) {

        // Team members can only view their own dashboard data — force memberId scoping
        if (!security.isAdmin()) {
            memberId = security.getCurrentUserId();
            // Team members cannot filter by arbitrary project/status across the team
            projectId = null;
            status = null;
        }

        return ResponseEntity.ok(
                dashboardService.getDashboard(weekStart, from, to, memberId, projectId, status));
    }
}
