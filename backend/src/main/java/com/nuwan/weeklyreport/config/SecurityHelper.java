package com.nuwan.weeklyreport.config;

import com.nuwan.weeklyreport.dao.entity.User;
import com.nuwan.weeklyreport.enums.UserRole;
import com.nuwan.weeklyreport.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Utility to access the currently authenticated user from the SecurityContext.
 * Used by controllers to enforce ownership and role-based access at the method level.
 */
@Component
public class SecurityHelper {

    /**
     * Get the currently authenticated user.
     *
     * @throws ApiException if no user is authenticated (should not happen for protected endpoints)
     */
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User user)) {
            throw new ApiException("Not authenticated", HttpStatus.UNAUTHORIZED);
        }
        return user;
    }

    /**
     * Get the current user's ID.
     */
    public String getCurrentUserId() {
        return getCurrentUser().getId();
    }

    /**
     * Check if the current user has the ADMIN role.
     */
    public boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User user)) {
            return false;
        }
        return user.getRole() == UserRole.ADMIN;
    }

    /**
     * Require the current user to be an ADMIN, or throw 403.
     */
    public void requireAdmin() {
        if (!isAdmin()) {
            throw new ApiException("Admin access required", HttpStatus.FORBIDDEN);
        }
    }

    /**
     * Require that the given authorId matches the current user, or that the user is an ADMIN.
     * Throws 403 if neither condition is met.
     */
    public void requireOwnerOrAdmin(String authorId) {
        User user = getCurrentUser();
        if (user.getRole() == UserRole.ADMIN) return;
        if (!user.getId().equals(authorId)) {
            throw new ApiException("Access denied: you can only access your own reports",
                    HttpStatus.FORBIDDEN);
        }
    }
}
