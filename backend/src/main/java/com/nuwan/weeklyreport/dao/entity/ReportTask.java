package com.nuwan.weeklyreport.dao.entity;

import com.nuwan.weeklyreport.enums.Priority;
import com.nuwan.weeklyreport.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "report_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReportTask {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @Column(nullable = false)
    private int plannedPercent;

    @Column(nullable = false)
    private int actualPercent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status;

    @Column(nullable = false)
    private double plannedHours;

    @Column(nullable = false)
    private double spentHours;

    @Column(columnDefinition = "TEXT")
    private String output;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }
}
