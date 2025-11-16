# Quick Start Guide

## 🚀 Run Locally in 5 Minutes

### 1. Setup Environment
```bash
cd neurosync-mcp
cp .env.example .env
# Edit .env with your GitHub token and repo info
```

### 2. Start Databases
```bash
docker-compose up -d postgres redis
```

### 3. Run Backend
```bash
cd backend
mvn spring-boot:run
# Wait for: "Started NeuroSyncApplication"
```

### 4. Run Frontend (New Terminal)
```bash
cd frontend
npm install
npm run dev
```

### 5. Open Browser
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/api/health

---

## 📤 Push to GitHub in 3 Steps

### 1. Initialize Git
```bash
git init
git add .
git commit -m "Initial commit: NeuroSync MCP project"
```

### 2. Create GitHub Repo
- Go to github.com → New repository
- Name: `neurosync-mcp`
- **Don't** initialize with README

### 3. Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/neurosync-mcp.git
git branch -M main
git push -u origin main
```

**⚠️ Important:** Make sure `.env` is NOT committed (check `.gitignore`)

---

## 🐳 Or Run Everything with Docker

```bash
docker-compose up -d
```

Then visit http://localhost:5173

---

For detailed instructions, see [SETUP.md](./SETUP.md)

