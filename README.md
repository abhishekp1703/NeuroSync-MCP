# NeuroSync-MCP

A Developer Productivity AI that plugs into MCP (Model Context Protocol) to automatically understand developer context and provide intelligent assistance.

## 🎯 Overview

NeuroSync automatically understands what a developer is working on by pulling real-time work context from:
- GitHub REST & GraphQL API (FREE tier)
- Hacker News API (FREE – for focus mode AI suggestions)
- Local file system context (MCP FS tool)
- Optional: OpenAI (for summarization + AI agent reasoning)

## 🏗️ Architecture

- **MCP Server** (Node.js/TypeScript): Exposes tools for GitHub, file system operations
- **Spring Boot Backend** (Java 21): REST API that aggregates context and stores memory
- **React Frontend** (Vite + TailwindCSS): Dashboard UI for developer productivity
- **PostgreSQL**: Context snapshots and developer memory
- **Redis**: Quick memory lookups and caching

## 🚀 Quick Start

### Prerequisites

- Java 21+
- Node.js 18+
- Docker & Docker Compose
- Maven 3.8+
- PostgreSQL 15+ (if running locally)
- Redis 7+ (if running locally)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd neurosync-mcp
   ```

2. **Set up environment variables**
   
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```
   
   **Required:**
   - `GITHUB_TOKEN`: Create a GitHub Personal Access Token with `repo` scope
   - `GITHUB_OWNER`: Your GitHub username or organization
   - `GITHUB_REPO`: Repository name
   
   **Optional:**
   - `OPENAI_API_KEY`: For AI-powered features (summarization, suggestions)

3. **Run with Docker Compose (Recommended)**
   ```bash
   docker-compose up -d
   ```
   
   This will start:
   - PostgreSQL on port 5432
   - Redis on port 6379
   - Spring Boot backend on port 8080
   - MCP server on port 3001
   - React frontend on port 5173

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080/api
   - Health check: http://localhost:8080/api/health

### Running Locally (Without Docker)

#### 1. Start PostgreSQL and Redis
   ```bash
   # Using Docker for databases only
   docker-compose up -d postgres redis
   ```

#### 2. Backend (Spring Boot)
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```
   
   The backend will start on http://localhost:8080

#### 3. MCP Server
   ```bash
   cd mcp-server
   npm install
   npm run build
   npm start
   ```
   
   The MCP server will run on stdio (for MCP client integration)

#### 4. Frontend
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   
   The frontend will start on http://localhost:5173

### Using DevContainer

If you're using VS Code with DevContainers:

1. Open the project in VS Code
2. Press `F1` and select "Dev Containers: Reopen in Container"
3. Wait for the container to build and start
4. All services will be available in the container

## 📁 Project Structure

```
neurosync-mcp/
├── backend/                      # Spring Boot application
│   ├── src/main/java/com/neurosync/
│   │   ├── controller/          # REST controllers
│   │   ├── service/             # Business logic
│   │   ├── repository/          # Data access layer
│   │   ├── entity/              # JPA entities
│   │   ├── dto/                 # Data transfer objects
│   │   └── config/              # Configuration classes
│   ├── src/main/resources/
│   │   ├── application.yml      # Spring Boot configuration
│   │   └── schema.sql           # Database schema
│   ├── pom.xml
│   └── Dockerfile
├── mcp-server/                   # MCP server (Node.js/TypeScript)
│   ├── src/
│   │   ├── index.ts             # MCP server entry point
│   │   └── tools/               # MCP tools implementation
│   │       ├── githubTools.ts   # GitHub API tools
│   │       └── fsTools.ts       # File system tools
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/                     # React application
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── services/            # API client
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile
├── .devcontainer/                # DevContainer configuration
│   └── devcontainer.json
├── docker-compose.yml            # Docker Compose configuration
├── .env.example                  # Environment variables template
└── README.md
```

## 🔧 Features

### MCP Server Tools
- `getGitHubIssues(repo)`: Fetch GitHub issues
- `getRecentCommits(repo/branch)`: Get recent commits
- `writeToFile(filepath, text)`: Write to file system
- `readActiveBranch(repoPath)`: Read active Git branch

### Backend Endpoints

#### GET `/api/context`
Get aggregated developer context including GitHub issues, commits, and recent snapshots.

**Query Parameters:**
- `branch` (optional): Filter by Git branch name

**Response:**
```json
{
  "activeBranch": "main",
  "isClean": true,
  "lastCommit": "abc1234",
  "issues": [...],
  "commits": [...],
  "recentSnapshots": [...],
  "timestamp": "2024-01-01T12:00:00"
}
```

#### POST `/api/memory`
Store a context snapshot in the database.

**Request Body:**
```json
{
  "issueNumber": 123,
  "commitHash": "abc1234",
  "branch": "main",
  "summary": "Fixed bug in authentication",
  "metadata": {
    "filesChanged": ["src/auth.js"],
    "linesAdded": 50,
    "linesRemoved": 20
  }
}
```

#### GET `/api/memory`
Retrieve context history.

**Query Parameters:**
- `branch` (optional): Filter by branch name
- `hours` (optional, default: 24): Number of hours to look back

#### GET `/api/health`
Health check endpoint.

### Frontend Dashboard
- Active branch display
- Open PRs list
- Assigned issues
- Code history timeline
- AI-powered actions (commit message generation, progress summarization)

## 🗄️ Database Schema

The `developer_context` table stores context snapshots:

```sql
CREATE TABLE developer_context (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    issue_number INTEGER,
    commit_hash VARCHAR(255),
    branch VARCHAR(255),
    summary TEXT,
    metadata JSONB
);
```

## 🔌 MCP Integration

The MCP server exposes the following tools that can be used by MCP clients (like Cursor, Windsurf):

1. **getGitHubIssues**: Fetch GitHub issues for a repository
2. **getRecentCommits**: Get recent commits for a branch
3. **readActiveBranch**: Read the active Git branch from local repository
4. **writeToFile**: Write content to a file
5. **readFromFile**: Read content from a file

### Using with Cursor/Windsurf

1. Configure the MCP server in your editor's settings
2. The server will be available as a tool provider
3. Use the tools through your editor's command palette

## 🧪 Development

### Building the Project

```bash
# Build backend
cd backend
mvn clean package

# Build MCP server
cd ../mcp-server
npm run build

# Build frontend
cd ../frontend
npm run build
```

### Running Tests

```bash
# Backend tests
cd backend
mvn test

# Frontend tests (when added)
cd ../frontend
npm test
```

### Code Style

- **Backend**: Follow Spring Boot conventions and Java 21 features
- **MCP Server**: Use TypeScript strict mode, ES modules
- **Frontend**: Use React functional components with TypeScript

## 🐛 Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `docker ps`
- Verify database credentials in `.env`
- Check logs: `docker-compose logs backend`

### MCP server errors
- Verify `GITHUB_TOKEN` is set correctly
- Check GitHub API rate limits
- Review MCP server logs

### Frontend can't connect to backend
- Verify backend is running on port 8080
- Check `VITE_API_URL` in frontend environment
- Ensure CORS is configured (already enabled in backend)

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

