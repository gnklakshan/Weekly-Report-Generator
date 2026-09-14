package com.nuwan.weeklyreport.controller;

import com.nuwan.weeklyreport.dto.request.ApproveReviewRequest;
import com.nuwan.weeklyreport.dto.response.ReportResponseDto;
import com.nuwan.weeklyreport.dto.request.RequestCorrectionRequest;
import com.nuwan.weeklyreport.dto.response.ReviewQueueItemDto;
import com.nuwan.weeklyreport.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/queue")
    public ResponseEntity<List<ReviewQueueItemDto>> getReviewQueue(
            @RequestParam String reviewerId) {
        return ResponseEntity.ok(reviewService.getReviewQueue(reviewerId));
    }

    @PostMapping("/approve")
    public ResponseEntity<ReportResponseDto> approveReport(@Valid @RequestBody ApproveReviewRequest request) {
        return ResponseEntity.ok(reviewService.approveReport(request));
    }

    @PostMapping("/request-correction")
    public ResponseEntity<ReportResponseDto> requestCorrection(
            @Valid @RequestBody RequestCorrectionRequest request) {
        return ResponseEntity.ok(reviewService.requestCorrection(request));
    }
}
