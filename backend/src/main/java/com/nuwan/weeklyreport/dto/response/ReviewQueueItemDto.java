package com.nuwan.weeklyreport.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewQueueItemDto {
    private ReportResponseDto report;
    private String authorName;
    private String projectName;
    private double waitingSinceHours;
}
