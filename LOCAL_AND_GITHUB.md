# 🚀 Running Locally & Pushing to GitHub

## Quick Reference

### Run Locally (3 Options)

#### Option 1: Automated Setup Script
```bash
cd neurosync-mcp
chmod +x scripts/setup.sh
./scripts/setup.sh
```

#### Option 2: Manual Setup
```bash
# 1. Setup environment
cp .env.example .env
# Edit .env with your GitHub token

# 2. Start databases
docker-compose up -d postgres redis

# 3. Start backend (Terminal 1)
cd backend
mvn spring-boot:run

# 4. Start frontend (Terminal 2)
cd frontend
npm install
npm run dev
```

#### Option 3: Docker Compose (All Services)
```bash
docker-compose up -d
```

### Push to GitHub

#### Option 1: Automated Script
```bash
chmod +x scripts/push-to-github.sh
./scripts/push-to-github.sh
```

#### Option 2: Manual Steps
```bash
# 1. Initialize git (if not done)
git init

# 2. Verify .env is in .gitignore
cat .gitignore | grep "^\\.env$"

# 3. Add and commit
git add .
git commit -m "Initial commit: NeuroSync MCP project"

# 4. Create repo on GitHub.com (don't initialize with README)

# 5. Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/neurosync-mcp.git
git branch -M main
git push -u origin main
```

---

## 📋 Detailed Steps

### Prerequisites
- ✅ Java 21+
- ✅ Node.js 18+
- ✅ Maven 3.8+
- ✅ Docker & Docker Compose
- ✅ Git

### Step 1: Get GitHub Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: "NeuroSync MCP"
4. Select scope: `repo` (full control)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)

### Step 2: Configure Environment

```bash
cd neurosync-mcp
cp .env.example .env
```

Edit `.env` file:
```env
GITHUB_TOKEN=your_token_here
GITHUB_OWNER=your_username
GITHUB_REPO=your_repo_name
```

### Step 3: Start Infrastructure

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Verify they're running
docker ps
```

### Step 4: Run Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Wait for: `Started NeuroSyncApplication in X seconds`

### Step 5: Run Frontend (New Terminal)

```bash
cd frontend
npm install
npm run dev
```

### Step 6: Verify

- Frontend: http://localhost:5173
- Backend: http://localhost:8080/api/health
- Test API: `curl http://localhost:8080/api/context`

---

## 📤 Pushing to GitHub

### Step 1: Verify .gitignore

Make sure `.env` is in `.gitignore`:
```bash
grep "^\.env$" .gitignore
```

If not, add it:
```bash
echo ".env" >> .gitignore
```

### Step 2: Initialize Git

```bash
git init
git add .
git status  # Verify .env is NOT listed
```

### Step 3: Create Initial Commit

```bash
git commit -m "feat: initial NeuroSync MCP project

- Spring Boot backend with REST API
- MCP server with GitHub tools
- React frontend dashboard
- Docker Compose configuration
- PostgreSQL and Redis integration"
```

### Step 4: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `neurosync-mcp`
3. Description: "Developer Productivity AI with MCP integration"
4. **Public** or **Private** (your choice)
5. **DO NOT** check "Initialize with README"
6. Click "Create repository"

### Step 5: Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/neurosync-mcp.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 6: Verify on GitHub

1. Go to your repository on GitHub
2. Verify all files are present
3. **IMPORTANT**: Verify `.env` is NOT in the repository
4. Check that `.env.example` IS in the repository

---

## 🔐 Security Checklist

Before pushing to GitHub:

- [ ] `.env` is in `.gitignore`
- [ ] `.env` is NOT tracked by git (`git ls-files .env` returns nothing)
- [ ] `.env.example` is committed (template without secrets)
- [ ] No API keys or tokens in code
- [ ] No database passwords in code
- [ ] Reviewed `git status` before committing

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check logs
docker-compose logs postgres
cd backend && mvn spring-boot:run
```

### Port already in use
```bash
# Find process on port 8080
lsof -i :8080

# Kill process or change port in application.yml
```

### Git push rejected
```bash
# If repository was initialized with README, pull first:
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### .env file is tracked
```bash
# Remove from git (keep local file)
git rm --cached .env
git commit -m "Remove .env from tracking"
git push
```

---

## 📚 Next Steps

After pushing to GitHub:

1. **Add README badges** (optional)
2. **Set up GitHub Actions** (CI/CD)
3. **Create GitHub Issues** (track features)
4. **Invite collaborators**
5. **Set up branch protection**
6. **Deploy to cloud** (AWS, GCP, Azure)

---

## 🆘 Need Help?

- Check [SETUP.md](./SETUP.md) for detailed setup
- Check [README.md](./README.md) for project overview
- Check [QUICKSTART.md](./QUICKSTART.md) for quick reference

