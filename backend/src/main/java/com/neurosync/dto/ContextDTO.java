package com.neurosync.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ContextDTO {

    private String activeBranch;
    private Boolean isClean;
    private String lastCommit;
    private List<GitHubIssue> issues;
    private List<GitHubCommit> commits;
    private List<ContextSnapshot> recentSnapshots;
    private LocalDateTime timestamp;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GitHubIssue {
        private Integer number;
        private String title;
        private String body;
        private String state;
        private String assignee;
        private List<String> labels;
        private String url;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GitHubCommit {
        private String sha;
        private String message;
        private String author;
        private String date;
        private String url;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContextSnapshot {
        private String id;
        private LocalDateTime timestamp;
        private Integer issueNumber;
        private String commitHash;
        private String branch;
        private String summary;
        private Map<String, Object> metadata;
    }
}

