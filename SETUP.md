# Local Setup and GitHub Deployment Guide

## 🚀 Running Locally

### Prerequisites Check

Before starting, ensure you have:
- ✅ Java 21+ installed (`java -version`)
- ✅ Node.js 18+ installed (`node -v`)
- ✅ Maven 3.8+ installed (`mvn -v`)
- ✅ Docker & Docker Compose installed (`docker --version`)
- ✅ Git installed (`git --version`)

### Step 1: Clone/Navigate to Project

```bash
cd neurosync-mcp
```

### Step 2: Set Up Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env file with your values
# Required: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO
nano .env  # or use your favorite editor
```

**Getting a GitHub Token:**
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Select scopes: `repo` (full control of private repositories)
4. Copy the token and add it to `.env` file

### Step 3: Start Infrastructure (PostgreSQL & Redis)

**Option A: Using Docker Compose (Recommended)**
```bash
# Start only databases
docker-compose up -d postgres redis

# Check they're running
docker ps
```

**Option B: Install Locally**
- Install PostgreSQL 15+ and Redis 7+
- Update connection strings in `.env` file

### Step 4: Initialize Database

```bash
# Connect to PostgreSQL (if using Docker)
docker exec -it neurosync-postgres psql -U neurosync -d neurosync

# Run the schema (or let Spring Boot auto-create it)
# The schema will be created automatically on first run via JPA
```

### Step 5: Run Backend

```bash
cd backend

# Install dependencies and build
mvn clean install

# Run the application
mvn spring-boot:run

# Backend should start on http://localhost:8080
# Check health: http://localhost:8080/api/health
```

### Step 6: Run MCP Server (Optional - for MCP client integration)

```bash
cd mcp-server

# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev

# Or run in production mode
npm start
```

### Step 7: Run Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Frontend should start on http://localhost:5173
```

### Step 8: Verify Everything Works

1. **Backend Health Check:**
   ```bash
   curl http://localhost:8080/api/health
   ```

2. **Get Context:**
   ```bash
   curl http://localhost:8080/api/context
   ```

3. **Open Frontend:**
   - Navigate to http://localhost:5173
   - You should see the NeuroSync dashboard

## 📦 Running with Docker Compose (All Services)

If you want to run everything with Docker:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check backend logs
docker-compose logs backend
# or if running locally
cd backend && mvn spring-boot:run
```

### Port already in use
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process or change port in application.yml
```

### Database connection errors
```bash
# Verify PostgreSQL is accessible
docker exec -it neurosync-postgres psql -U neurosync -d neurosync -c "SELECT 1;"

# Check connection string in .env
```

### Frontend can't connect to backend
```bash
# Verify backend is running
curl http://localhost:8080/api/health

# Check VITE_API_URL in frontend/.env (if using custom port)
```

---

## 📤 Pushing to GitHub

### Step 1: Create GitHub Repository

1. Go to GitHub.com
2. Click "New repository"
3. Name it: `neurosync-mcp` (or your preferred name)
4. **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

### Step 2: Initialize Git (if not already done)

```bash
cd neurosync-mcp

# Check if git is already initialized
git status

# If not initialized, run:
git init
```

### Step 3: Verify .gitignore

Make sure `.gitignore` is present and includes:
- `.env` (contains secrets!)
- `node_modules/`
- `target/`
- `dist/`
- IDE files

### Step 4: Add Files and Commit

```bash
# Check what will be committed (should NOT include .env)
git status

# Add all files
git add .

# Verify .env is NOT included
git status

# Create initial commit
git commit -m "Initial commit: NeuroSync MCP project setup"

# Or create a more detailed commit
git commit -m "feat: initial NeuroSync MCP project

- Spring Boot backend with REST API
- MCP server with GitHub and file system tools
- React frontend dashboard
- Docker Compose configuration
- PostgreSQL and Redis integration"
```

### Step 5: Add Remote and Push

```bash
# Add your GitHub repository as remote
# Replace <your-username> and <repo-name> with your actual values
git remote add origin https://github.com/<your-username>/neurosync-mcp.git

# Or if using SSH:
# git remote add origin git@github.com:<your-username>/neurosync-mcp.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 6: Verify on GitHub

1. Go to your GitHub repository
2. Verify all files are present
3. **IMPORTANT:** Verify `.env` is NOT in the repository (it should be in .gitignore)

### Step 7: Set Up GitHub Secrets (for CI/CD - Optional)

If you plan to use GitHub Actions:

1. Go to repository → Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `GITHUB_TOKEN` (for API access)
   - `POSTGRES_PASSWORD`
   - `OPENAI_API_KEY` (if using)

### Step 8: Create .env.example for Team Members

Make sure `.env.example` is committed (it should be):
- It contains template values without real secrets
- Team members can copy it to create their own `.env`

## 🔐 Security Best Practices

1. **Never commit `.env` file** - It contains secrets
2. **Use `.env.example`** - Template without secrets
3. **Add `.env` to `.gitignore`** - Already done
4. **Rotate tokens regularly** - Especially if accidentally committed
5. **Use GitHub Secrets** - For CI/CD pipelines
6. **Review commits** - Before pushing, check `git status` and `git diff`

## 📝 Additional Git Commands

### Check what will be committed
```bash
git status
git diff --cached
```

### Undo last commit (keep changes)
```bash
git reset --soft HEAD~1
```

### Create a new branch
```bash
git checkout -b feature/new-feature
git push -u origin feature/new-feature
```

### Update from remote
```bash
git pull origin main
```

## 🚀 Next Steps

After pushing to GitHub:

1. **Set up GitHub Actions** (optional) - For CI/CD
2. **Create GitHub Issues** - Track features and bugs
3. **Set up branch protection** - Protect main branch
4. **Add collaborators** - Invite team members
5. **Deploy to cloud** - AWS, GCP, Azure, etc.

## 📚 Resources

- [GitHub Docs](https://docs.github.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [React Docs](https://react.dev/)
- [MCP Protocol](https://modelcontextprotocol.io/)

