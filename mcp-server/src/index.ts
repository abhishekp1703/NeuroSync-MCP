#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { getGitHubIssues, getRecentCommits, readActiveBranch } from './tools/githubTools.js';
import { writeToFile, readFromFile } from './tools/fsTools.js';
import dotenv from 'dotenv';

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || '';
const GITHUB_REPO = process.env.GITHUB_REPO || '';

if (!GITHUB_TOKEN) {
  console.error('GITHUB_TOKEN environment variable is required');
  process.exit(1);
}

class NeuroSyncMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'neurosync-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'getGitHubIssues',
            description: 'Fetch GitHub issues for a repository. Returns open issues assigned to the user or all issues if no owner/repo specified.',
            inputSchema: {
              type: 'object',
              properties: {
                owner: {
                  type: 'string',
                  description: 'GitHub repository owner (optional, uses env var if not provided)',
                },
                repo: {
                  type: 'string',
                  description: 'GitHub repository name (optional, uses env var if not provided)',
                },
                state: {
                  type: 'string',
                  enum: ['open', 'closed', 'all'],
                  description: 'Issue state filter',
                  default: 'open',
                },
              },
            },
          },
          {
            name: 'getRecentCommits',
            description: 'Get recent commits for a repository and branch',
            inputSchema: {
              type: 'object',
              properties: {
                owner: {
                  type: 'string',
                  description: 'GitHub repository owner (optional, uses env var if not provided)',
                },
                repo: {
                  type: 'string',
                  description: 'GitHub repository name (optional, uses env var if not provided)',
                },
                branch: {
                  type: 'string',
                  description: 'Branch name (optional, defaults to default branch)',
                },
                perPage: {
                  type: 'number',
                  description: 'Number of commits to fetch (default: 10)',
                  default: 10,
                },
              },
            },
          },
          {
            name: 'readActiveBranch',
            description: 'Read the active Git branch from a local repository path',
            inputSchema: {
              type: 'object',
              properties: {
                repoPath: {
                  type: 'string',
                  description: 'Path to the Git repository (default: current directory)',
                  default: '.',
                },
              },
              required: ['repoPath'],
            },
          },
          {
            name: 'writeToFile',
            description: 'Write text content to a file',
            inputSchema: {
              type: 'object',
              properties: {
                filepath: {
                  type: 'string',
                  description: 'Path to the file to write',
                },
                text: {
                  type: 'string',
                  description: 'Content to write to the file',
                },
              },
              required: ['filepath', 'text'],
            },
          },
          {
            name: 'readFromFile',
            description: 'Read content from a file',
            inputSchema: {
              type: 'object',
              properties: {
                filepath: {
                  type: 'string',
                  description: 'Path to the file to read',
                },
              },
              required: ['filepath'],
            },
          },
        ] as Tool[],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'getGitHubIssues': {
            const owner = (args as any)?.owner || GITHUB_OWNER;
            const repo = (args as any)?.repo || GITHUB_REPO;
            const state = (args as any)?.state || 'open';
            const result = await getGitHubIssues(GITHUB_TOKEN!, owner, repo, state);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'getRecentCommits': {
            const owner = (args as any)?.owner || GITHUB_OWNER;
            const repo = (args as any)?.repo || GITHUB_REPO;
            const branch = (args as any)?.branch;
            const perPage = (args as any)?.perPage || 10;
            const result = await getRecentCommits(GITHUB_TOKEN!, owner, repo, branch, perPage);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'readActiveBranch': {
            const repoPath = (args as any)?.repoPath || '.';
            const result = await readActiveBranch(repoPath);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'writeToFile': {
            const filepath = (args as any)?.filepath;
            const text = (args as any)?.text;
            if (!filepath || text === undefined) {
              throw new Error('filepath and text are required');
            }
            const result = await writeToFile(filepath, text);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'readFromFile': {
            const filepath = (args as any)?.filepath;
            if (!filepath) {
              throw new Error('filepath is required');
            }
            const result = await readFromFile(filepath);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: errorMessage }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('NeuroSync MCP Server running on stdio');
  }
}

const server = new NeuroSyncMCPServer();
server.run().catch(console.error);

