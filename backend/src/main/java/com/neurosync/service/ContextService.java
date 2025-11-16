package com.neurosync.service;

import com.neurosync.dto.ContextDTO;
import com.neurosync.dto.MemoryRequestDTO;
import com.neurosync.entity.DeveloperContext;
import com.neurosync.repository.DeveloperContextRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContextService {

    private final DeveloperContextRepository repository;
    private final GitHubService githubService;

    @Transactional
    public ContextDTO getAggregatedContext(String branch) {
        log.info("Fetching aggregated context for branch: {}", branch);

        ContextDTO.ContextDTOBuilder builder = ContextDTO.builder()
                .timestamp(LocalDateTime.now());

        // Fetch GitHub data in parallel
        var issuesMono = githubService.getIssues("open");
        var commitsMono = githubService.getRecentCommits(branch, 10);

        // Block to get results (in production, consider reactive endpoints)
        List<ContextDTO.GitHubIssue> issues = issuesMono.block();
        List<ContextDTO.GitHubCommit> commits = commitsMono.block();

        builder.issues(issues != null ? issues : List.of())
                .commits(commits != null ? commits : List.of());

        // Get recent snapshots
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        List<DeveloperContext> recentContexts = branch != null
                ? repository.findRecentByBranch(branch, since)
                : repository.findRecentContexts(since);

        List<ContextDTO.ContextSnapshot> snapshots = recentContexts.stream()
                .map(this::mapToSnapshot)
                .collect(Collectors.toList());

        builder.recentSnapshots(snapshots);

        return builder.build();
    }

    @Transactional
    public DeveloperContext saveContext(MemoryRequestDTO request) {
        log.info("Saving context: branch={}, issue={}", request.getBranch(), request.getIssueNumber());

        DeveloperContext context = DeveloperContext.builder()
                .issueNumber(request.getIssueNumber())
                .commitHash(request.getCommitHash())
                .branch(request.getBranch())
                .summary(request.getSummary())
                .metadata(request.getMetadata())
                .build();

        return repository.save(context);
    }

    @Transactional(readOnly = true)
    public List<ContextDTO.ContextSnapshot> getContextHistory(String branch, int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        List<DeveloperContext> contexts = branch != null
                ? repository.findRecentByBranch(branch, since)
                : repository.findRecentContexts(since);

        return contexts.stream()
                .map(this::mapToSnapshot)
                .collect(Collectors.toList());
    }

    private ContextDTO.ContextSnapshot mapToSnapshot(DeveloperContext context) {
        return ContextDTO.ContextSnapshot.builder()
                .id(context.getId().toString())
                .timestamp(context.getTimestamp())
                .issueNumber(context.getIssueNumber())
                .commitHash(context.getCommitHash())
                .branch(context.getBranch())
                .summary(context.getSummary())
                .metadata(context.getMetadata())
                .build();
    }
}

