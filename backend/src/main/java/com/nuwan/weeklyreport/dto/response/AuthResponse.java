package com.nuwan.weeklyreport.dto.response;

import com.nuwan.weeklyreport.dto.response.UserDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private UserDto user;
    private String token;
    private String issuedAt;
}
