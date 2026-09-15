package com.nuwan.weeklyreport.dao.repository;

import com.nuwan.weeklyreport.dao.entity.Report;
import com.nuwan.weeklyreport.enums.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, String> {

    List<Report> findByAuthorIdOrderByWeekStartDesc(String authorId);

    List<Report> findByStatusOrderByWeekStartDesc(ReportStatus status);

    List<Report> findByAuthorIdAndStatusOrderByWeekStartDesc(String authorId, ReportStatus status);

    @Query("SELECT r FROM Report r WHERE " +
           "(:authorId IS NULL OR r.author.id = :authorId) AND " +
           "(:projectId IS NULL OR r.project.id = :projectId) AND " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:weekStart IS NULL OR r.weekStart = :weekStart) AND " +
           "(:from IS NULL OR r.weekStart >= :from) AND " +
           "(:to IS NULL OR r.weekEnd <= :to) " +
           "ORDER BY r.weekStart DESC")
    List<Report> findFiltered(
            @Param("authorId") String authorId,
            @Param("projectId") String projectId,
            @Param("status") ReportStatus status,
            @Param("weekStart") LocalDate weekStart,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query("SELECT r FROM Report r WHERE " +
           "(:authorId IS NULL OR r.author.id = :authorId) AND " +
           "(:projectId IS NULL OR r.project.id = :projectId) AND " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:weekStart IS NULL OR r.weekStart = :weekStart) AND " +
           "(:from IS NULL OR r.weekStart >= :from) AND " +
           "(:to IS NULL OR r.weekEnd <= :to) AND " +
           "(:excludeStatus IS NULL OR r.status <> :excludeStatus) " +
           "ORDER BY r.weekStart DESC")
    List<Report> findFilteredExcludingDrafts(
            @Param("authorId") String authorId,
            @Param("projectId") String projectId,
            @Param("status") ReportStatus status,
            @Param("weekStart") LocalDate weekStart,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("excludeStatus") ReportStatus excludeStatus);

    @Query("SELECT r FROM Report r WHERE " +
           "(:authorId IS NULL OR r.author.id = :authorId) AND " +
           "(:projectId IS NULL OR r.project.id = :projectId) AND " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:weekStart IS NULL OR r.weekStart = :weekStart) AND " +
           "(:from IS NULL OR r.weekStart >= :from) AND " +
           "(:to IS NULL OR r.weekEnd <= :to) " +
           "ORDER BY r.weekStart DESC")
    Page<Report> findFilteredPageable(
            @Param("authorId") String authorId,
            @Param("projectId") String projectId,
            @Param("status") ReportStatus status,
            @Param("weekStart") LocalDate weekStart,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            Pageable pageable);

    @Query("SELECT r FROM Report r WHERE " +
           "(:authorId IS NULL OR r.author.id = :authorId) AND " +
           "(:projectId IS NULL OR r.project.id = :projectId) AND " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:weekStart IS NULL OR r.weekStart = :weekStart) AND " +
           "(:from IS NULL OR r.weekStart >= :from) AND " +
           "(:to IS NULL OR r.weekEnd <= :to) AND " +
           "(:excludeStatus IS NULL OR r.status <> :excludeStatus) " +
           "ORDER BY r.weekStart DESC")
    Page<Report> findFilteredExcludingDraftsPageable(
            @Param("authorId") String authorId,
            @Param("projectId") String projectId,
            @Param("status") ReportStatus status,
            @Param("weekStart") LocalDate weekStart,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("excludeStatus") ReportStatus excludeStatus,
            Pageable pageable);

    @Query("SELECT r FROM Report r WHERE r.status = :status ORDER BY r.submittedAt ASC")
    List<Report> findSubmittedReports(@Param("status") ReportStatus status);

    @Query("SELECT COUNT(r) FROM Report r WHERE r.weekStart = :weekStart")
    long countByWeekStart(@Param("weekStart") LocalDate weekStart);

    @Query("SELECT COUNT(r) FROM Report r WHERE r.weekStart = :weekStart AND r.status = :status")
    long countByWeekStartAndStatus(@Param("weekStart") LocalDate weekStart,
                                   @Param("status") ReportStatus status);

    @Query("SELECT r FROM Report r WHERE r.author.id = :authorId AND r.weekStart = :weekStart")
    List<Report> findByAuthorIdAndWeekStart(@Param("authorId") String authorId,
                                            @Param("weekStart") LocalDate weekStart);

    boolean existsByAuthorIdAndWeekStart(String authorId, LocalDate weekStart);
}
