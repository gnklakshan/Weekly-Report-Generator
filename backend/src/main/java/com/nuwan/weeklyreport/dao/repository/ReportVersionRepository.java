package com.nuwan.weeklyreport.dao.repository;

import com.nuwan.weeklyreport.dao.entity.ReportVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportVersionRepository extends JpaRepository<ReportVersion, String> {

    List<ReportVersion> findByReportIdOrderByVersionNumberAsc(String reportId);
}
