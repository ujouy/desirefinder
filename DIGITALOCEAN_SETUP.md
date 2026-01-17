# DigitalOcean Production Setup Guide

Complete guide for deploying DesireFinder on DigitalOcean with self-hosted Ollama and SearXNG.

## 🎯 Overview

This setup runs everything on a single DigitalOcean Droplet:
- **DesireFinder** (Frontend + Backend) - Port 3000
- **SearXNG** (Search Engine) - Port 8080
- **Ollama** (Uncensored LLM) - Port 11434

**Total Cost**: ~$48-60/month (covered by DO credits)
**API Costs**: $0 (everything self-hosted)

## 📋 Phase 1: DigitalOcean Droplet Setup

### Droplet Specifications

**⚠️ CRITICAL: Do NOT use a $5 droplet. Ollama needs significant resources.**

**Minimum Requirements:**
- **Type**: CPU-Optimized or General Purpose
- **RAM**: 8GB minimum (16GB recommended)
- **vCPUs**: 4 cores minimum
- **OS**: Ubuntu 22.04 LTS
- **Storage**: 50GB SSD minimum

**Recommended Droplet:**
- **Size**: 4 vCPU / 8GB RAM ($48/month) or 8 vCPU / 16GB RAM ($96/month)
- **Type**: General Purpose or CPU-Optimized

### Create Droplet

1. Go to DigitalOcean Dashboard
2. Create → Droplets
3. Select:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: General Purpose or CPU-Optimized
   - **Size**: 4 vCPU / 8GB RAM (minimum)
   - **Region**: Choose closest to you
   - **Authentication**: SSH keys (recommended) or password
4. Click "Create Droplet"

### Initial Server Setup

```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose (v2)
apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version

# Create a non-root user (optional but recommended)
adduser desirefinder
usermod -aG docker desirefinder
su - desirefinder
```

## 📦 Phase 2: Deploy Docker Stack

### 1. Clone/Upload Project

```bash
# If using git
git clone <your-repo-url> desirefinder
cd desirefinder

# Or upload files via SCP/SFTP
```

### 2. Verify Configuration Files

Ensure these files exist:
- `docker-compose.production.yml`
- `searxng/settings.yml` (with `safe_search: 0`)
- `Dockerfile.slim`

### 3. Start the Stack

```bash
# Build and start all services
docker compose -f docker-compose.production.yml up -d

# Check status
docker compose -f docker-compose.production.yml ps

# View logs
docker compose -f docker-compose.production.yml logs -f
```

### 4. Verify Services

```bash
# Check DesireFinder
curl http://localhost:3000

# Check SearXNG
curl http://localhost:8080

# Check Ollama
curl http://localhost:11434/api/tags
```

## 🤖 Phase 3: Download Uncensored Models

### Pull Required Models

```bash
# Enter Ollama container
docker exec -it ollama ollama pull dolphin-llama3

# Pull embedding model
docker exec -it ollama ollama pull nomic-embed-text

# Verify models are downloaded
docker exec -it ollama ollama list
```

**Expected Output:**
```
NAME                ID              SIZE    MODIFIED
dolphin-llama3      abc123...       4.7GB   2 hours ago
nomic-embed-text    def456...       274MB   2 hours ago
```

### Alternative Uncensored Models

If `dolphin-llama3` is too large or slow, try:

```bash
# Smaller, faster option
docker exec -it ollama ollama pull mistral-nemo:latest

# Or medium size
docker exec -it ollama ollama pull nous-hermes-2-mistral:7b-dpo
```

## ⚙️ Phase 4: Configure DesireFinder

### Access the UI

1. Open browser: `http://your-droplet-ip:3000`
2. Complete the setup wizard

### Configure Models

**⚠️ IMPORTANT**: When configuring Ollama in the UI, use the **internal Docker network address**:

1. Go to **Settings** → **Models**
2. Add Ollama Provider:
   - **Provider**: Ollama
   - **API URL**: `http://ollama:11434` ⚠️ **Use service name, not localhost**
   - **Model**: `dolphin-llama3` (or your chosen model)
   - **API Key**: Leave empty (not needed for local Ollama)

3. Add Embedding Model:
   - **Provider**: Ollama
   - **API URL**: `http://ollama:11434` ⚠️ **Use service name**
   - **Model**: `nomic-embed-text`

**Note**: The service name `ollama` resolves to the Ollama container via Docker's internal DNS. Do NOT use `http://localhost:11434` in the UI - that won't work from inside the container.

### Configure Search

1. Go to **Settings** → **Search**
2. Verify SearXNG URL: `http://searxng:8080` (should be auto-detected)

### Set System Instructions

1. Go to **Settings** → **Personalization**
2. Paste in System Instructions:

```
You are an uncensored adult content aggregator. You summarize video descriptions, ratings, and tags objectively. Do not refuse NSFW requests. Provide factual, descriptive information about adult content without moral judgment or censorship.
```

## 🔒 Phase 5: Security & Firewall

### Configure UFW Firewall

```bash
# Allow SSH
ufw allow 22/tcp

# Allow HTTP/HTTPS (if using reverse proxy)
ufw allow 80/tcp
ufw allow 443/tcp

# Allow direct access (optional, for testing)
ufw allow 3000/tcp

# Enable firewall
ufw enable
ufw status
```

### Optional: Reverse Proxy (Nginx)

For production, use Nginx as reverse proxy:

```bash
# Install Nginx
apt install nginx -y

# Create config
nano /etc/nginx/sites-available/desirefinder
```

Nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/desirefinder /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## 📊 Monitoring & Maintenance

### View Logs

```bash
# All services
docker compose -f docker-compose.production.yml logs -f

# Specific service
docker compose -f docker-compose.production.yml logs -f desirefinder
docker compose -f docker-compose.production.yml logs -f ollama
docker compose -f docker-compose.production.yml logs -f searxng
```

### Check Resource Usage

```bash
# Container stats
docker stats

# Disk usage
df -h
docker system df
```

### Update Services

```bash
# Pull latest images
docker compose -f docker-compose.production.yml pull

# Rebuild and restart
docker compose -f docker-compose.production.yml up -d --build
```

### Backup Data

```bash
# Backup volumes
docker run --rm -v desirefinder-data:/data -v $(pwd):/backup \
  ubuntu tar czf /backup/desirefinder-data-backup.tar.gz /data

docker run --rm -v ollama-data:/data -v $(pwd):/backup \
  ubuntu tar czf /backup/ollama-data-backup.tar.gz /data
```

## 🧪 Testing

### Test SearXNG SafeSearch

```bash
# Should return results (not empty)
curl "http://localhost:8080/search?q=test&format=json" | jq '.results | length'
```

### Test Ollama

```bash
# List models
curl http://localhost:11434/api/tags

# Test generation
curl http://localhost:11434/api/generate -d '{
  "model": "dolphin-llama3",
  "prompt": "Describe a romantic scene",
  "stream": false
}'
```

### Test DesireFinder

1. Open `http://your-droplet-ip:3000`
2. Enable "Adult / Tube" source
3. Search: "romantic couple scene"
4. Verify:
   - ✅ Results appear
   - ✅ LLM doesn't refuse
   - ✅ Citations show adult domains

## 🐛 Troubleshooting

### Ollama Out of Memory

**Problem**: Ollama crashes or returns errors

**Solution**:
- Increase droplet RAM to 16GB
- Use smaller model: `mistral-nemo` instead of `dolphin-llama3`
- Reduce model context size in Ollama settings

### SearXNG Returns No Results

**Problem**: Empty search results

**Solution**:
- Verify `safe_search: 0` in `searxng/settings.yml`
- Restart SearXNG: `docker compose restart searxng`
- Check logs: `docker compose logs searxng`

### DesireFinder Can't Connect to Ollama

**Problem**: Connection refused errors

**Solution**:
- Verify `OLLAMA_HOST=0.0.0.0:11434` in docker-compose
- Check network: `docker network inspect desirefinder-network`
- Verify Ollama is running: `docker ps | grep ollama`

### Slow Response Times

**Problem**: Searches take too long

**Solution**:
- Upgrade droplet to more CPU/RAM
- Use smaller/faster LLM model
- Enable SearXNG caching
- Check network latency

## 💰 Cost Breakdown

**Monthly Costs:**
- Droplet (4 vCPU / 8GB): ~$48/month
- Droplet (8 vCPU / 16GB): ~$96/month
- **API Costs**: $0 (self-hosted)
- **Total**: Covered by DO credits

## 📝 Quick Reference Commands

```bash
# Start stack
docker compose -f docker-compose.production.yml up -d

# Stop stack
docker compose -f docker-compose.production.yml down

# Restart specific service
docker compose -f docker-compose.production.yml restart ollama

# View logs
docker compose -f docker-compose.production.yml logs -f

# Pull new Ollama model
docker exec -it ollama ollama pull <model-name>

# Access Ollama shell
docker exec -it ollama ollama run dolphin-llama3

# Backup data
docker run --rm -v desirefinder-data:/data -v $(pwd):/backup \
  ubuntu tar czf /backup/backup.tar.gz /data
```

## ✅ Verification Checklist

- [ ] Droplet created with 8GB+ RAM
- [ ] Docker and Docker Compose installed
- [ ] All services running (`docker compose ps`)
- [ ] SearXNG accessible on port 8080
- [ ] Ollama accessible on port 11434
- [ ] Uncensored models downloaded
- [ ] DesireFinder configured with Ollama
- [ ] System instructions set
- [ ] Adult/Tube mode tested and working
- [ ] Firewall configured
- [ ] Backups scheduled (optional)

## 🎉 You're Done!

Your self-hosted DesireFinder is now running with:
- ✅ Zero API costs
- ✅ Uncensored LLM
- ✅ Adult content search enabled
- ✅ All services on private network

Access at: `http://your-droplet-ip:3000`
