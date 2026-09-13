package com.nuwan.weeklyreport.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrendPointDto {
    private String weekLabel;
    private String weekStart;
    private int tasksCompleted;
    private double hours;
}
