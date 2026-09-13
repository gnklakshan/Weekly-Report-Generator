package com.nuwan.weeklyreport.dto.response;

import com.nuwan.weeklyreport.enums.Priority;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlannedTaskDto {
    private String id;
    private String title;
    private Priority priority;
    private double plannedHours;
}
