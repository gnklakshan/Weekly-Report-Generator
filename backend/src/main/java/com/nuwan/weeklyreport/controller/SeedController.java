package com.nuwan.weeklyreport.controller;

import com.nuwan.weeklyreport.service.SeedService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * On-demand seed endpoint. Call POST /api/seed to populate the database
 * with demo data (users, projects, reports, activities).
 * Only works when the database is empty — returns a message if data already exists.
 */
@RestController
@RequestMapping("/api/seed")
public class SeedController {

    private final SeedService seedService;

    public SeedController(SeedService seedService) {
        this.seedService = seedService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> seed() {
        return ResponseEntity.ok(seedService.seed());
    }
}
