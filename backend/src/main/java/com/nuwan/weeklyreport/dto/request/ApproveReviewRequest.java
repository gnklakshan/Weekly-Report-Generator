package com.nuwan.weeklyreport.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApproveReviewRequest {
    @NotBlank
    private String reportId;

    @NotBlank
    private String reviewerId;

    private String message;
}
