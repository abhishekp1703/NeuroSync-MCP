# NeuroSync-MCP

**Context-Aware Development Intelligence Platform**

NeuroSync-MCP transforms developer productivity by automatically aggregating and synthesizing work context from multiple sources—GitHub activity, local repositories, and team workflows—into actionable intelligence. Built on the Model Context Protocol (MCP), it eliminates context switching and keeps developers in flow.

---

## Why NeuroSync?

Modern development involves constant context switching: checking GitHub for issues, reviewing PR feedback, tracking commits, and maintaining mental models of your work. NeuroSync eliminates this cognitive overhead by:

- **Automatic Context Aggregation** — Pulls real-time data from GitHub, local Git repositories, and file systems without manual intervention
- **Intelligent Memory Layer** — Stores and retrieves contextual snapshots, making it easy to resume work or understand historical decisions
- **MCP-Native Architecture** — Integrates seamlessly with MCP-enabled editors like Cursor and Windsurf for in-editor intelligence
- **Zero Configuration Intelligence** — Works with GitHub's free tier; no enterprise subscriptions required

---

## System Architecture

NeuroSync follows a clean, distributed architecture designed for scalability and maintainability:

```
┌─────────────────────────────────────────────────────────────┐
│                      MCP Client Layer                        │
│                 (Cursor, Windsurf, Claude)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    MCP Server (Node.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ GitHub Tools │  │  FS Tools    │  │  Git Tools   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Spring Boot REST API (Java 21)                  │
│  ┌────────────────────────────────────────────────┐         │
│  │  Context Aggregation • Memory Storage • APIs   │         │
│  └────────────────────────────────────────────────┘         │
└───────────┬─────────────────────────┬───────────────────────┘
            │                         │
            ▼                         ▼
   ┌────────────────┐        ┌────────────────┐
   │   PostgreSQL   │        │     Redis      │
   │  (Persistence) │        │   (Caching)    │
   └────────────────┘        └────────────────┘
```

**Technology Stack:**
- **Backend**: Spring Boot 3.x (Java 21), PostgreSQL 15+, Redis 7+
- **MCP Layer**: Node.js 18+, TypeScript 5.x
- **Frontend**: React 18, Vite 5, TailwindCSS 3.x
- **Infrastructure**: Docker, Docker Compose

---

## Prerequisites

| Requirement | Version | Purpose |
|------------|---------|---------|
| Java | 21+ | Spring Boot backend runtime |
| Node.js | 18+ | MCP server and frontend tooling |
| Docker | 20+ | Containerized deployment |
| Maven | 3.8+ | Backend dependency management |
| PostgreSQL | 15+ | Context persistence layer |
| Redis | 7+ | High-speed caching and memory lookups |

**Access Requirements:**
- GitHub Personal Access Token (PAT) with `repo` scope
- Repository access permissions for target GitHub repos

---

## Installation & Setup

### Option 1: Docker Compose (Recommended)

The fastest path to a running system. All services are orchestrated automatically.

```bash
# Clone repository
git clone <repository-url>
cd neurosync-mcp

# Configure environment
cp .env.example .env
# Edit .env with your GitHub token and repository details

# Launch all services
docker-compose up -d

# Verify deployment
curl http://localhost:8080/api/health
```

**Service Endpoints:**
- Frontend Dashboard: `http://localhost:5173`
- Backend API: `http://localhost:8080/api`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

### Option 2: Local Development Setup

For active development or debugging, run services individually.

```bash
# 1. Start data layer
docker-compose up -d postgres redis

# 2. Backend API
cd backend
mvn clean install
mvn spring-boot:run
# Runs on http://localhost:8080

# 3. MCP Server
cd ../mcp-server
npm install && npm run build
npm start
# Communicates via stdio with MCP clients

# 4. Frontend Dashboard
cd ../frontend
npm install && npm run dev
# Runs on http://localhost:5173
```

### Option 3: VS Code DevContainer

Fully configured development environment with all dependencies pre-installed.

1. Open project in VS Code
2. Command Palette → **Dev Containers: Reopen in Container**
3. Wait for container initialization
4. All services start automatically

---

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# GitHub Integration (Required)
GITHUB_TOKEN=ghp_your_personal_access_token_here
GITHUB_OWNER=your-username-or-org
GITHUB_REPO=repository-name

# OpenAI Integration (Optional - enables AI features)
OPENAI_API_KEY=sk-your-openai-api-key

# Database Configuration (Docker defaults)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=neurosync
POSTGRES_USER=neurosync
POSTGRES_PASSWORD=your-secure-password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Application Settings
SPRING_PROFILES_ACTIVE=dev
LOG_LEVEL=INFO
```

### GitHub Token Permissions

Required scopes for your GitHub PAT:
- `repo` — Full repository access (read issues, commits, branches)
- `read:user` — Basic user profile information

Generate at: https://github.com/settings/tokens/new

---

## API Reference

### Context Aggregation

**Endpoint:** `GET /api/context`

Retrieves comprehensive developer context including active work, recent changes, and issue tracking.

**Query Parameters:**
```
branch (optional) — Filter context by Git branch name
```

**Response Schema:**
```json
{
  "activeBranch": "feature/auth-refactor",
  "isClean": false,
  "lastCommit": "a3f8c91",
  "uncommittedChanges": 3,
  "issues": [
    {
      "number": 142,
      "title": "Refactor authentication middleware",
      "state": "open",
      "assignee": "developer",
      "labels": ["enhancement", "backend"]
    }
  ],
  "commits": [
    {
      "hash": "a3f8c91",
      "message": "Add JWT token validation",
      "author": "Developer Name",
      "timestamp": "2024-01-15T14:23:00Z",
      "filesChanged": 5
    }
  ],
  "recentSnapshots": [...],
  "timestamp": "2024-01-15T15:00:00Z"
}
```

### Memory Storage

**Endpoint:** `POST /api/memory`

Persists a context snapshot for future retrieval and analysis.

**Request Body:**
```json
{
  "issueNumber": 142,
  "commitHash": "a3f8c91",
  "branch": "feature/auth-refactor",
  "summary": "Completed JWT middleware implementation",
  "metadata": {
    "filesChanged": ["src/middleware/auth.js", "src/utils/jwt.js"],
    "linesAdded": 87,
    "linesRemoved": 12,
    "testsCovered": true
  }
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "stored": true,
  "timestamp": "2024-01-15T15:00:00Z"
}
```

### Memory Retrieval

**Endpoint:** `GET /api/memory`

Query historical context snapshots with time-based filtering.

**Query Parameters:**
```
branch (optional) — Filter by branch name
hours (optional, default: 24) — Lookback window in hours
limit (optional, default: 50) — Maximum results
```

### Health & Status

**Endpoint:** `GET /api/health`

System health check for monitoring and orchestration.

**Response:**
```json
{
  "status": "UP",
  "components": {
    "database": "UP",
    "redis": "UP",
    "github": "UP"
  },
  "timestamp": "2024-01-15T15:00:00Z"
}
```

---

## MCP Integration

NeuroSync exposes intelligent tools through the Model Context Protocol for seamless editor integration.

### Available Tools

| Tool Name | Purpose | Parameters |
|-----------|---------|------------|
| `getGitHubIssues` | Fetch repository issues | `repo: string` |
| `getRecentCommits` | Retrieve commit history | `repo: string, branch?: string` |
| `readActiveBranch` | Get current Git branch | `repoPath: string` |
| `writeToFile` | Write file system content | `filepath: string, content: string` |
| `readFromFile` | Read file system content | `filepath: string` |

### Editor Configuration

**Cursor / Windsurf:**

Add to your MCP settings (`.cursor/mcp.json` or equivalent):

```json
{
  "mcpServers": {
    "neurosync": {
      "command": "node",
      "args": ["./mcp-server/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "your_token_here",
        "GITHUB_OWNER": "your_username",
        "GITHUB_REPO": "your_repo"
      }
    }
  }
}
```

Access tools via editor command palette or AI assistant integration.

---

## Development Workflow

### Building from Source

```bash
# Backend (Spring Boot)
cd backend
mvn clean package
# Output: target/neurosync-backend-1.0.0.jar

# MCP Server (TypeScript)
cd mcp-server
npm run build
# Output: dist/

# Frontend (React)
cd frontend
npm run build
# Output: dist/
```

### Running Tests

```bash
# Backend unit & integration tests
cd backend
mvn test
mvn verify

# Frontend tests (when available)
cd frontend
npm test

# End-to-end tests (when available)
npm run test:e2e
```

### Code Quality Standards

**Backend (Java):**
- Java 21 language features encouraged (records, pattern matching, virtual threads)
- Spring Boot best practices (dependency injection, configuration properties)
- Layered architecture (controller → service → repository)
- Comprehensive Javadoc for public APIs

**MCP Server (TypeScript):**
- Strict TypeScript mode enabled
- ES modules throughout
- Async/await for all I/O operations
- Type-safe MCP tool definitions

**Frontend (React):**
- Functional components exclusively
- TypeScript for all components
- Tailwind utility classes (no custom CSS)
- Accessibility-first design

---

## Project Structure

```
neurosync-mcp/
├── backend/                          # Spring Boot REST API
│   ├── src/main/java/com/neurosync/
│   │   ├── controller/              # HTTP endpoint handlers
│   │   ├── service/                 # Business logic layer
│   │   ├── repository/              # JPA data access
│   │   ├── entity/                  # Database models
│   │   ├── dto/                     # API data contracts
│   │   └── config/                  # Spring configuration
│   ├── src/main/resources/
│   │   ├── application.yml          # Spring Boot config
│   │   └── schema.sql               # Database DDL
│   └── pom.xml                      # Maven dependencies
│
├── mcp-server/                       # MCP protocol server
│   ├── src/
│   │   ├── index.ts                 # Server entry point
│   │   └── tools/                   # MCP tool implementations
│   │       ├── githubTools.ts       # GitHub API integration
│   │       ├── fsTools.ts           # File system operations
│   │       └── gitTools.ts          # Git repository tools
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                         # React dashboard
│   ├── src/
│   │   ├── components/              # React UI components
│   │   ├── services/                # API client layer
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── App.tsx                  # Application root
│   │   └── main.tsx                 # Entry point
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── .devcontainer/                    # VS Code DevContainer
├── docker-compose.yml                # Orchestration config
├── .env.example                      # Environment template
└── README.md
```

---

## Database Schema

**Table: `developer_context`**

Stores contextual snapshots of developer activity for memory and analysis.

```sql
CREATE TABLE developer_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    issue_number INTEGER,
    commit_hash VARCHAR(255),
    branch VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    INDEX idx_branch (branch),
    INDEX idx_timestamp (timestamp DESC),
    INDEX idx_issue (issue_number),
    INDEX idx_commit (commit_hash)
);
```

**JSONB Metadata Structure:**
```json
{
  "filesChanged": ["src/auth.js", "tests/auth.test.js"],
  "linesAdded": 150,
  "linesRemoved": 45,
  "testsCovered": true,
  "reviewers": ["alice", "bob"],
  "tags": ["security", "refactor"]
}
```

---

## Troubleshooting

### Backend Issues

**Symptom:** Backend fails to start
```bash
# Check database connectivity
docker-compose logs postgres

# Verify environment variables
cat .env | grep POSTGRES

# Test database connection
psql -h localhost -U neurosync -d neurosync
```

**Symptom:** GitHub API rate limit exceeded
- GitHub's free tier: 60 requests/hour (unauthenticated), 5000/hour (authenticated)
- Verify `GITHUB_TOKEN` is set correctly
- Check rate limit status: `curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/rate_limit`

### MCP Server Issues

**Symptom:** MCP tools not appearing in editor
```bash
# Verify MCP server build
cd mcp-server
npm run build

# Check for TypeScript errors
npm run type-check

# Test MCP server directly
node dist/index.js
```

**Symptom:** "GitHub authentication failed"
- Ensure PAT has `repo` scope
- Verify token hasn't expired
- Check repository permissions for GITHUB_OWNER/GITHUB_REPO

### Frontend Issues

**Symptom:** Cannot connect to backend API
```bash
# Verify backend is running
curl http://localhost:8080/api/health

# Check CORS configuration (already enabled)
# Check frontend API URL configuration
cat frontend/.env | grep VITE_API_URL
```

**Symptom:** Build errors with Vite
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
```

---

## Performance Considerations

### Caching Strategy

- **Redis**: Caches GitHub API responses (5-minute TTL)
- **PostgreSQL**: Full-text search on context snapshots
- **Backend**: Spring Boot caching annotations on expensive operations

### Scaling Recommendations

**Horizontal Scaling:**
- Backend: Stateless Spring Boot instances behind load balancer
- MCP Server: One instance per developer (local process)
- Frontend: CDN distribution for static assets

**Vertical Scaling:**
- PostgreSQL: Increase `shared_buffers` for larger datasets
- Redis: Increase `maxmemory` for larger cache

**Database Optimization:**
- Regular `VACUUM ANALYZE` on high-write tables
- Partition `developer_context` by month for large datasets
- Index tuning based on query patterns

---

## Security Best Practices

1. **Never commit `.env` files** — Use `.env.example` as template
2. **Rotate GitHub PATs regularly** — Generate new tokens quarterly
3. **Use Docker secrets** — For production deployments, use Docker secrets or vault solutions
4. **Network isolation** — Keep PostgreSQL and Redis on private networks
5. **API authentication** — Add authentication layer for production (OAuth2/JWT)

---

## Contributing
Please follow these guidelines:

1. **Fork** the repository
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Write tests** for new functionality
4. **Follow code style** (see Development Workflow section)
5. **Commit with clear messages** (Conventional Commits format)
6. **Push to branch** (`git push origin feature/amazing-feature`)
7. **Open Pull Request** with detailed description

---

## License

MIT License — See [LICENSE](LICENSE) file for details.
