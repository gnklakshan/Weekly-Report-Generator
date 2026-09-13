package com.nuwan.weeklyreport.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlockerDto {
    private String id;
    private String description;
    private Boolean keyIssue;
}
