package com.nuwan.weeklyreport.controller;

import com.nuwan.weeklyreport.dto.response.ActivityItemDto;
import com.nuwan.weeklyreport.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity")
public class ActivityController {

    private final DashboardService dashboardService;

    public ActivityController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<List<ActivityItemDto>> getActivity(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(dashboardService.getActivity(limit));
    }
}
