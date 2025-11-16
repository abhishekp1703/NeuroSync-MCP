#!/bin/bash

# NeuroSync MCP - Push to GitHub Script
# This script helps push the project to GitHub

set -e

echo "📤 NeuroSync MCP - Push to GitHub"
echo "=================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
    echo ""
fi

# Check if .env is in gitignore
if ! grep -q "^\\.env$" .gitignore 2>/dev/null; then
    echo "⚠️  Warning: .env might not be in .gitignore"
    echo "   Make sure .env is excluded before committing!"
    echo ""
fi

# Check for uncommitted .env file
if git ls-files --error-unmatch .env >/dev/null 2>&1; then
    echo "❌ ERROR: .env file is tracked by git!"
    echo "   Remove it with: git rm --cached .env"
    echo "   Then commit the removal"
    exit 1
fi

# Show status
echo "📋 Current git status:"
git status --short
echo ""

# Ask for confirmation
read -p "Do you want to add all files and commit? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
fi

# Add files
echo "📦 Adding files..."
git add .
echo "✅ Files added"
echo ""

# Create commit
read -p "Enter commit message (or press Enter for default): " commit_message
if [ -z "$commit_message" ]; then
    commit_message="feat: initial NeuroSync MCP project setup"
fi

echo "💾 Creating commit..."
git commit -m "$commit_message"
echo "✅ Commit created"
echo ""

# Check if remote exists
if git remote | grep -q "^origin$"; then
    echo "✅ Remote 'origin' already exists"
    git remote -v
    echo ""
    
    read -p "Do you want to push to origin/main? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git branch -M main 2>/dev/null || true
        git push -u origin main
        echo "✅ Pushed to GitHub!"
    else
        echo "📤 To push manually, run:"
        echo "   git push -u origin main"
    fi
else
    echo "📡 No remote repository configured"
    echo ""
    echo "To add a remote repository, run:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/neurosync-mcp.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
    echo "Or if using SSH:"
    echo "   git remote add origin git@github.com:YOUR_USERNAME/neurosync-mcp.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
fi

echo ""
echo "✅ Done!"

