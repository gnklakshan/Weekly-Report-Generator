package com.nuwan.weeklyreport.dao.repository;

import com.nuwan.weeklyreport.dao.entity.Project;
import com.nuwan.weeklyreport.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {

    List<Project> findByStatus(ProjectStatus status);

    @Query("SELECT p FROM Project p WHERE " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Project> search(@Param("search") String search);

    long countByStatus(ProjectStatus status);
}
