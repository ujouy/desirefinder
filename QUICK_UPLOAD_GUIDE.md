# ⚡ Quick Upload Guide - Stop Current Upload!

## 🛑 Stop the Current Upload

**Press `Ctrl+C` in your PowerShell window** to stop the current upload.

It's uploading everything including `node_modules` (which is huge and unnecessary).

## ✅ Better Approach: Upload Only Essential Files

### Option 1: Use the PowerShell Script (Recommended)

**In PowerShell, run:**

```powershell
cd D:\DesireFinder
.\scripts\upload-essential-files.ps1
```

This will upload only:
- ✅ `docker-compose.production.yml`
- ✅ `Dockerfile.slim`
- ✅ `src/` folder
- ✅ `public/` folder
- ✅ `prisma/` folder
- ✅ `searxng/` folder
- ✅ Config files (package.json, etc.)

**Excludes:**
- ❌ `node_modules/` (will be installed in Docker)
- ❌ `.next/` (will be built in Docker)
- ❌ `.git/` (not needed)

### Option 2: Manual Upload (Essential Files Only)

**Stop current upload (Ctrl+C), then run:**

```powershell
cd D:\DesireFinder

# Upload essential files
scp -o StrictHostKeyChecking=no docker-compose.production.yml Dockerfile.slim package.json package-lock.json next.config.mjs tsconfig.json tailwind.config.ts postcss.config.js .env root@165.232.140.104:/root/desirefinder/

# Upload essential folders
scp -r -o StrictHostKeyChecking=no src root@165.232.140.104:/root/desirefinder/
scp -r -o StrictHostKeyChecking=no public root@165.232.140.104:/root/desirefinder/
scp -r -o StrictHostKeyChecking=no prisma root@165.232.140.104:/root/desirefinder/
scp -r -o StrictHostKeyChecking=no searxng root@165.232.140.104:/root/desirefinder/
```

### Option 3: Use Git Clone (If You Have a Repo)

**In your SSH session on the droplet:**

```bash
# Install git
apt install git -y

# Clone your repo (replace with your actual repo URL)
git clone <your-repo-url> /root/desirefinder
cd /root/desirefinder
```

## 🚀 After Upload - Deploy

**In your SSH session:**

```bash
cd /root/desirefinder

# Edit .env with your values
nano .env

# Start the stack (Docker will build everything)
docker compose -f docker-compose.production.yml up -d --build

# Wait 30 seconds
sleep 30

# Check status
docker compose -f docker-compose.production.yml ps

# Download models
docker exec -it ollama ollama pull dolphin-llama3
docker exec -it ollama ollama pull nomic-embed-text
```

## 💡 Why This is Faster

- **Current upload**: ~500MB+ (includes node_modules, .next, .git)
- **Essential files only**: ~50MB (just source code)
- **Docker builds**: Everything else is built inside the container

## ⏱️ Time Comparison

- **Full upload**: 10-30 minutes (what you're doing now)
- **Essential files**: 1-2 minutes
- **Docker build**: 5-10 minutes (but happens on server, faster)

**Total time saved: 15-20 minutes!**
