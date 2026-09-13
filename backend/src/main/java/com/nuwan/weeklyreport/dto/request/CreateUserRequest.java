package com.nuwan.weeklyreport.dto.request;

import com.nuwan.weeklyreport.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {
    @NotBlank
    private String fullName;

    @NotBlank
    @Email
    private String email;

    @NotNull
    private UserRole role;

    @NotBlank
    private String jobTitle;

    private List<String> projectIds;
}
