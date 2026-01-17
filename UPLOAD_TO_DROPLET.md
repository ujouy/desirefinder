# 📤 Upload DesireFinder to Your Droplet

Your droplet IP: `165.232.140.104`

## Option 1: Using Git Clone (Easiest if you have a repo)

**On your droplet (SSH session):**

```bash
# Clone your repository
git clone <your-repo-url> desirefinder
cd desirefinder

# Start the stack
docker compose -f docker-compose.production.yml up -d

# Download models
docker exec -it ollama ollama pull dolphin-llama3
docker exec -it ollama ollama pull nomic-embed-text
```

## Option 2: Using SCP (Upload from Windows)

**From your local Windows machine (PowerShell):**

```powershell
# Navigate to your DesireFinder folder
cd D:\DesireFinder

# Upload entire project (excluding node_modules and .git)
scp -r -o "StrictHostKeyChecking=no" `
    --exclude="node_modules" `
    --exclude=".git" `
    --exclude=".next" `
    --exclude="data" `
    . root@165.232.140.104:/root/desirefinder
```

**Or use WinSCP (GUI tool):**
1. Download WinSCP: https://winscp.net
2. Connect to: `root@165.232.140.104`
3. Upload your project folder

## Option 3: Using rsync (Best for updates)

**From your local machine:**

```bash
# Install rsync on Windows (via WSL or Git Bash)
# Or use PowerShell with rsync if available

rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.next' --exclude 'data' \
    ./ root@165.232.140.104:/root/desirefinder/
```

## Option 4: Manual File Transfer (Small files)

**For just essential files:**

```powershell
# Upload docker-compose file
scp docker-compose.production.yml root@165.232.140.104:/root/desirefinder/

# Upload other essential files one by one
scp Dockerfile.slim root@165.232.140.104:/root/desirefinder/
scp -r searxng root@165.232.140.104:/root/desirefinder/
scp -r src root@165.232.140.104:/root/desirefinder/
scp package.json root@165.232.140.104:/root/desirefinder/
scp .env root@165.232.140.104:/root/desirefinder/
```

## 🚀 After Uploading - Deploy

**On your droplet (SSH session):**

```bash
# Navigate to project
cd /root/desirefinder

# Create .env file if needed
nano .env
# Paste your environment variables

# Start the stack
docker compose -f docker-compose.production.yml up -d

# Wait 30 seconds, then check status
docker compose -f docker-compose.production.yml ps

# Download models (takes 5-10 minutes)
docker exec -it ollama ollama pull dolphin-llama3
docker exec -it ollama ollama pull nomic-embed-text

# Check logs
docker compose -f docker-compose.production.yml logs -f
```

## 📝 Quick Commands Summary

**If using Git:**
```bash
git clone <your-repo> desirefinder && cd desirefinder && docker compose -f docker-compose.production.yml up -d
```

**If uploading via SCP:**
```powershell
# From Windows PowerShell
scp -r D:\DesireFinder root@165.232.140.104:/root/desirefinder
```
