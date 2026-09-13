package com.nuwan.weeklyreport.dao.repository;

import com.nuwan.weeklyreport.dao.entity.ReviewComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewCommentRepository extends JpaRepository<ReviewComment, String> {

    List<ReviewComment> findByReportIdOrderByCreatedAtAsc(String reportId);
}
