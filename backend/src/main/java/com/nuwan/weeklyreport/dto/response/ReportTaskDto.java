package com.nuwan.weeklyreport.dto.response;

import com.nuwan.weeklyreport.enums.Priority;
import com.nuwan.weeklyreport.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportTaskDto {
    private String id;
    private String title;
    private Priority priority;
    private int plannedPercent;
    private int actualPercent;
    private TaskStatus status;
    private double plannedHours;
    private double spentHours;
    private String output;
}
