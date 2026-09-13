package com.nuwan.weeklyreport.dto.response;

import com.nuwan.weeklyreport.enums.ReviewDecision;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewCommentDto {
    private String id;
    private String reportId;
    private int versionNumber;
    private String authorId;
    private String message;
    private ReviewDecision decision;
    private String createdAt;
}
