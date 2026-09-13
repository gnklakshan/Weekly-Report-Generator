package com.nuwan.weeklyreport.dto.response;

import com.nuwan.weeklyreport.enums.UserRole;
import com.nuwan.weeklyreport.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private String id;
    private String fullName;
    private String email;
    private UserRole role;
    private UserStatus status;
    private String jobTitle;
    private String avatarUrl;
    private List<String> projectIds;
    private String managerId;
    private String joinedAt;
}
