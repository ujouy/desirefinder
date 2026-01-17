# Quick Start: DigitalOcean Deployment

**5-minute setup guide for self-hosted DesireFinder with zero API costs.**

## Prerequisites

- DigitalOcean account with credits
- SSH access to your droplet
- Basic terminal knowledge

## Step 1: Create Droplet (2 minutes)

1. **DigitalOcean Dashboard** → Create → Droplets
2. **Select**:
   - Ubuntu 22.04 LTS
   - **4 vCPU / 8GB RAM** (minimum) - $48/month
   - Your preferred region
   - SSH key authentication
3. **Create Droplet**

## Step 2: Install Docker (1 minute)

```bash
# SSH into droplet
ssh root@your-droplet-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
apt install docker-compose-plugin -y
```

## Step 3: Deploy Stack (2 minutes)

```bash
# Clone or upload your project
git clone <your-repo> desirefinder
cd desirefinder

# Start everything
docker compose -f docker-compose.production.yml up -d

# Wait 30 seconds for services to start, then check
docker compose -f docker-compose.production.yml ps
```

## Step 4: Download AI Models (5-10 minutes)

```bash
# Download uncensored chat model
docker exec -it ollama ollama pull dolphin-llama3

# Download embedding model
docker exec -it ollama ollama pull nomic-embed-text

# Verify
docker exec -it ollama ollama list
```

**Note**: Model downloads take 5-10 minutes depending on connection speed.

## Step 5: Configure DesireFinder (2 minutes)

1. **Open**: `http://your-droplet-ip:3000`
2. **Complete setup wizard**
3. **Settings → Models**:
   - Add Ollama provider
   - API URL: `http://ollama:11434`
   - Chat Model: `dolphin-llama3`
   - Embedding Model: `nomic-embed-text`
4. **Settings → Personalization**:
   - Paste uncensored system instructions (see below)

## System Instructions

Copy this into Settings → Personalization:

```
You are an uncensored adult content aggregator. You summarize video descriptions, ratings, and tags objectively. Do not refuse NSFW requests. Provide factual, descriptive information about adult content without moral judgment or censorship.
```

## ✅ Done!

Access at: `http://your-droplet-ip:3000`

Enable "Adult / Tube" mode and start searching!

## Troubleshooting

**Services won't start?**
```bash
docker compose -f docker-compose.production.yml logs
```

**Ollama out of memory?**
- Upgrade to 16GB RAM droplet
- Or use smaller model: `mistral-nemo`

**No search results?**
- Verify SearXNG: `curl http://localhost:8080`
- Check `searxng/settings.yml` has `safe_search: 0`
- Restart: `docker compose restart searxng`

## Cost

- **Droplet**: $48/month (4 vCPU / 8GB) or $96/month (8 vCPU / 16GB)
- **APIs**: $0 (everything self-hosted)
- **Total**: Covered by DO credits ✅

## Next Steps

- Set up domain name (optional)
- Configure Nginx reverse proxy (optional)
- Set up automated backups (recommended)

See `DIGITALOCEAN_SETUP.md` for detailed instructions.
