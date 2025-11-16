package com.neurosync.repository;

import com.neurosync.entity.DeveloperContext;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface DeveloperContextRepository extends JpaRepository<DeveloperContext, UUID> {

    List<DeveloperContext> findByBranchOrderByTimestampDesc(String branch);

    List<DeveloperContext> findByIssueNumberOrderByTimestampDesc(Integer issueNumber);

    @Query("SELECT dc FROM DeveloperContext dc WHERE dc.timestamp >= :since ORDER BY dc.timestamp DESC")
    List<DeveloperContext> findRecentContexts(@Param("since") LocalDateTime since);

    @Query("SELECT dc FROM DeveloperContext dc WHERE dc.branch = :branch AND dc.timestamp >= :since ORDER BY dc.timestamp DESC")
    List<DeveloperContext> findRecentByBranch(@Param("branch") String branch, @Param("since") LocalDateTime since);
}

