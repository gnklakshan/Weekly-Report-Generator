package com.nuwan.weeklyreport.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatusByMemberPointDto {
    private String memberId;
    private String memberName;
    private int draft;
    private int submitted;
    private int needsCorrection;
    private int approved;
}
