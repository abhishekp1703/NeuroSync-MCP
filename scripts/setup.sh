#!/bin/bash

# NeuroSync MCP Setup Script
# This script helps set up the project locally

set -e

echo "🚀 NeuroSync MCP Setup Script"
echo "=============================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

command -v java >/dev/null 2>&1 || { echo "❌ Java is required but not installed. Aborting." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v mvn >/dev/null 2>&1 || { echo "❌ Maven is required but not installed. Aborting." >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }

echo "✅ All prerequisites met!"
echo ""

# Setup environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your GitHub token and repository info"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Setup backend
echo "🔧 Setting up backend..."
cd backend
if [ ! -d "target" ]; then
    echo "📦 Installing Maven dependencies..."
    mvn clean install -DskipTests
else
    echo "✅ Backend dependencies already installed"
fi
cd ..
echo ""

# Setup MCP server
echo "🔧 Setting up MCP server..."
cd mcp-server
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
else
    echo "✅ MCP server dependencies already installed"
fi
cd ..
echo ""

# Setup frontend
echo "🔧 Setting up frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
else
    echo "✅ Frontend dependencies already installed"
fi
cd ..
echo ""

# Start databases
echo "🐳 Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis
echo "✅ Databases started!"
echo ""

echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "1. Edit .env file with your GitHub token: nano .env"
echo "2. Start backend: cd backend && mvn spring-boot:run"
echo "3. Start frontend: cd frontend && npm run dev"
echo "4. Open http://localhost:5173 in your browser"
echo ""
echo "Or run everything with Docker: docker-compose up -d"

