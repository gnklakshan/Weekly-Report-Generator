package com.nuwan.weeklyreport.dto.response;

import com.nuwan.weeklyreport.enums.TaskType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskTypeSliceDto {
    private TaskType taskType;
    private String label;
    private double hours;
}
