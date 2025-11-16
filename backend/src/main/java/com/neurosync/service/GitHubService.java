package com.neurosync.service;

import com.neurosync.dto.ContextDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class GitHubService {

    private final WebClient.Builder webClientBuilder;

    @Value("${github.token}")
    private String githubToken;

    @Value("${github.owner}")
    private String githubOwner;

    @Value("${github.repo}")
    private String githubRepo;

    private WebClient getWebClient() {
        return webClientBuilder
                .baseUrl("https://api.github.com")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "token " + githubToken)
                .defaultHeader(HttpHeaders.ACCEPT, "application/vnd.github.v3+json")
                .build();
    }

    public Mono<List<ContextDTO.GitHubIssue>> getIssues(String state) {
        if (githubToken == null || githubToken.isEmpty()) {
            log.warn("GitHub token not configured");
            return Mono.just(List.of());
        }

        return getWebClient()
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/repos/{owner}/{repo}/issues")
                        .queryParam("state", state != null ? state : "open")
                        .queryParam("per_page", 100)
                        .build(githubOwner, githubRepo))
                .retrieve()
                .bodyToFlux(GitHubIssueResponse.class)
                .map(this::mapToIssueDTO)
                .collectList()
                .doOnError(error -> log.error("Error fetching GitHub issues", error))
                .onErrorReturn(List.of());
    }

    public Mono<List<ContextDTO.GitHubCommit>> getRecentCommits(String branch, int perPage) {
        if (githubToken == null || githubToken.isEmpty()) {
            log.warn("GitHub token not configured");
            return Mono.just(List.of());
        }

        String sha = branch != null ? branch : "HEAD";

        return getWebClient()
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/repos/{owner}/{repo}/commits")
                        .queryParam("sha", sha)
                        .queryParam("per_page", perPage)
                        .build(githubOwner, githubRepo))
                .retrieve()
                .bodyToFlux(GitHubCommitResponse.class)
                .map(this::mapToCommitDTO)
                .collectList()
                .doOnError(error -> log.error("Error fetching GitHub commits", error))
                .onErrorReturn(List.of());
    }

    private ContextDTO.GitHubIssue mapToIssueDTO(GitHubIssueResponse response) {
        return ContextDTO.GitHubIssue.builder()
                .number(response.number)
                .title(response.title)
                .body(response.body)
                .state(response.state)
                .assignee(response.assignee != null ? response.assignee.login : null)
                .labels(response.labels != null
                        ? response.labels.stream().map(l -> l.name).toList()
                        : List.of())
                .url(response.html_url)
                .build();
    }

    private ContextDTO.GitHubCommit mapToCommitDTO(GitHubCommitResponse response) {
        return ContextDTO.GitHubCommit.builder()
                .sha(response.sha != null ? response.sha.substring(0, 7) : "")
                .message(response.commit != null && response.commit.message != null
                        ? response.commit.message.split("\n")[0]
                        : "")
                .author(response.commit != null && response.commit.author != null
                        ? response.commit.author.name
                        : "Unknown")
                .date(response.commit != null && response.commit.author != null
                        ? response.commit.author.date
                        : "")
                .url(response.html_url)
                .build();
    }

    // Inner classes for GitHub API responses
    private static class GitHubIssueResponse {
        public Integer number;
        public String title;
        public String body;
        public String state;
        public Assignee assignee;
        public List<Label> labels;
        public String html_url;
    }

    private static class Assignee {
        public String login;
    }

    private static class Label {
        public String name;
    }

    private static class GitHubCommitResponse {
        public String sha;
        public Commit commit;
        public String html_url;
    }

    private static class Commit {
        public String message;
        public Author author;
    }

    private static class Author {
        public String name;
        public String date;
    }
}

