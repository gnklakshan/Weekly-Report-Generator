package com.nuwan.weeklyreport.dto.response;

import com.nuwan.weeklyreport.enums.ActivityKind;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityItemDto {
    private String id;
    private ActivityKind kind;
    private String actorId;
    private String actorName;
    private String reportId;
    private String message;
    private String createdAt;
}
