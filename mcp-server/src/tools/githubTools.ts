import { Octokit } from '@octokit/rest';
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  state: string;
  assignee: string | null;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  url: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export interface BranchInfo {
  branch: string;
  repoPath: string;
  isClean: boolean;
  lastCommit: string;
}

/**
 * Fetch GitHub issues for a repository
 */
export async function getGitHubIssues(
  token: string,
  owner: string,
  repo: string,
  state: 'open' | 'closed' | 'all' = 'open'
): Promise<{ issues: GitHubIssue[]; total: number }> {
  const octokit = new Octokit({ auth: token });

  try {
    const response = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state,
      per_page: 100,
    });

    const issues: GitHubIssue[] = response.data.map((issue) => ({
      number: issue.number,
      title: issue.title,
      body: issue.body || '',
      state: issue.state,
      assignee: issue.assignee?.login || null,
      labels: issue.labels.map((label) => (typeof label === 'string' ? label : label.name)),
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      url: issue.html_url,
    }));

    return {
      issues,
      total: issues.length,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch GitHub issues: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get recent commits for a repository and branch
 */
export async function getRecentCommits(
  token: string,
  owner: string,
  repo: string,
  branch?: string,
  perPage: number = 10
): Promise<{ commits: GitHubCommit[]; total: number }> {
  const octokit = new Octokit({ auth: token });

  try {
    // Get default branch if not specified
    if (!branch) {
      const repoInfo = await octokit.rest.repos.get({ owner, repo });
      branch = repoInfo.data.default_branch;
    }

    const response = await octokit.rest.repos.listCommits({
      owner,
      repo,
      sha: branch,
      per_page: perPage,
    });

    const commits: GitHubCommit[] = response.data.map((commit) => ({
      sha: commit.sha.substring(0, 7),
      message: commit.commit.message.split('\n')[0], // First line only
      author: commit.commit.author?.name || 'Unknown',
      date: commit.commit.author?.date || '',
      url: commit.html_url,
    }));

    return {
      commits,
      total: commits.length,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch commits: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Read the active Git branch from a local repository
 */
export function readActiveBranch(repoPath: string = '.'): BranchInfo {
  try {
    const gitDir = join(repoPath, '.git');
    if (!existsSync(gitDir)) {
      throw new Error(`Not a Git repository: ${repoPath}`);
    }

    // Get current branch
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: repoPath,
      encoding: 'utf-8',
    }).trim();

    // Check if working directory is clean
    const status = execSync('git status --porcelain', {
      cwd: repoPath,
      encoding: 'utf-8',
    }).trim();
    const isClean = status === '';

    // Get last commit
    const lastCommit = execSync('git rev-parse --short HEAD', {
      cwd: repoPath,
      encoding: 'utf-8',
    }).trim();

    return {
      branch,
      repoPath,
      isClean,
      lastCommit,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to read Git branch: ${error.message}`);
    }
    throw error;
  }
}

