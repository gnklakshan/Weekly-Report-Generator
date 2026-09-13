package com.nuwan.weeklyreport.dto.response;

import com.nuwan.weeklyreport.enums.ReportStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportVersionDto {
    private int versionNumber;
    private String submittedAt;
    private ReportStatus status;
    private String reviewCommentId;
}
