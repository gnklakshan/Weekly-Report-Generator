package com.nuwan.weeklyreport.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestCorrectionRequest {
    @NotBlank
    private String reportId;

    @NotBlank
    private String reviewerId;

    @NotBlank
    private String message;
}
