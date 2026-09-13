package com.nuwan.weeklyreport.dao.entity;

import com.nuwan.weeklyreport.enums.ReportStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "report_versions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReportVersion {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;

    @Column(nullable = false)
    private int versionNumber;

    @Column(nullable = false)
    private LocalDate submittedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus status;

    @Column(name = "review_comment_id")
    private String reviewCommentId;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }
}
