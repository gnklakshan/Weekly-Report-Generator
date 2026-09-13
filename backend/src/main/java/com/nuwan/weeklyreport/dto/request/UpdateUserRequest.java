package com.nuwan.weeklyreport.dto.request;

import com.nuwan.weeklyreport.enums.UserRole;
import com.nuwan.weeklyreport.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
    private String fullName;
    private UserRole role;
    private UserStatus status;
    private String jobTitle;
    private List<String> projectIds;
}
