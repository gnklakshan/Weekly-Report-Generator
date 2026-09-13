package com.nuwan.weeklyreport.dao.repository;

import com.nuwan.weeklyreport.dao.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, String> {

    @Query("SELECT a FROM Activity a ORDER BY a.createdAt DESC LIMIT :limit")
    List<Activity> findRecent(int limit);

    List<Activity> findByActorIdOrderByCreatedAtDesc(String actorId);
}
