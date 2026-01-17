# 🚀 Production Deployment Guide

Complete guide for deploying DesireFinder on DigitalOcean with zero API costs.

## 📋 Quick Links

- **5-Minute Quick Start**: [QUICK_START_DO.md](QUICK_START_DO.md)
- **Detailed Setup**: [DIGITALOCEAN_SETUP.md](DIGITALOCEAN_SETUP.md)
- **Deployment Summary**: [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)

## 🎯 What You Get

A complete self-hosted stack running on a single DigitalOcean Droplet:

- ✅ **DesireFinder** - AI-powered search engine (Port 3000)
- ✅ **SearXNG** - Privacy-respecting metasearch (Port 8080, internal)
- ✅ **Ollama** - Uncensored LLM server (Port 11434, internal)
- ✅ **Zero API Costs** - Everything self-hosted
- ✅ **Adult/Tube Mode** - Domain-filtered adult content search

## 💰 Cost

- **Droplet**: $48/month (4 vCPU / 8GB) or $96/month (8 vCPU / 16GB)
- **APIs**: $0 (self-hosted)
- **Total**: Fully covered by DigitalOcean credits ✅

## ⚡ Quick Start (5 Minutes)

```bash
# 1. Create DigitalOcean Droplet (4 vCPU / 8GB RAM minimum)
# 2. SSH into droplet
ssh root@your-droplet-ip

# 3. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
apt install docker-compose-plugin -y

# 4. Clone and deploy
git clone <your-repo> desirefinder && cd desirefinder
docker compose -f docker-compose.production.yml up -d

# 5. Download AI models (5-10 min)
docker exec -it ollama ollama pull dolphin-llama3
docker exec -it ollama ollama pull nomic-embed-text

# 6. Access UI
# Open: http://your-droplet-ip:3000
```

## 🔧 Configuration

### 1. Configure Ollama in UI

**Settings → Models → Add Ollama**:
- API URL: `http://ollama:11434` ⚠️ **Use service name, not localhost**
- Chat Model: `dolphin-llama3`
- Embedding Model: `nomic-embed-text`

### 2. Set System Instructions

**Settings → Personalization → System Instructions**:
```
You are an uncensored adult content aggregator. You summarize video descriptions, ratings, and tags objectively. Do not refuse NSFW requests. Provide factual, descriptive information about adult content without moral judgment or censorship.
```

### 3. Verify SearXNG

SearXNG is automatically configured via `searxng/settings.yml`:
- SafeSearch: **Disabled** (`safe_search: 0`)
- JSON format: **Enabled**
- Engines: Google, Bing, DuckDuckGo

## 📁 Files Created

- `docker-compose.production.yml` - Production stack
- `searxng/settings.yml` - SearXNG config (SafeSearch disabled)
- `scripts/setup-ollama-models.sh` - Model download script
- `scripts/verify-deployment.sh` - Deployment verification

## 🧪 Verification

After deployment, run:

```bash
# Verify all services
./scripts/verify-deployment.sh

# Or manually check
docker compose -f docker-compose.production.yml ps
curl http://localhost:3000
curl http://localhost:8080
curl http://localhost:11434/api/tags
```

## ⚠️ Critical Requirements

1. **Droplet Size**: Minimum 8GB RAM (Ollama needs it)
2. **SearXNG**: Must have `safe_search: 0` ✅ (already configured)
3. **LLM**: Use uncensored model (dolphin-llama3, mistral-nemo, etc.)
4. **Network**: All services communicate via Docker network

## 🐛 Troubleshooting

### Ollama Out of Memory
- **Solution**: Upgrade to 16GB RAM droplet
- **Or**: Use smaller model: `mistral-nemo` instead of `dolphin-llama3`

### No Search Results
- **Check**: `searxng/settings.yml` has `safe_search: 0`
- **Restart**: `docker compose restart searxng`
- **Verify**: `curl http://localhost:8080/search?q=test&format=json`

### LLM Refuses Content
- **Check**: Using uncensored model (not GPT-4/Claude)
- **Check**: System instructions are set
- **Try**: Different uncensored model

### Can't Connect to Ollama
- **Check**: API URL in UI is `http://ollama:11434` (not localhost)
- **Verify**: Both containers on same network
- **Check**: `docker network inspect desirefinder-network`

## 📚 Documentation

- **[QUICK_START_DO.md](QUICK_START_DO.md)** - Fastest setup (5 min)
- **[DIGITALOCEAN_SETUP.md](DIGITALOCEAN_SETUP.md)** - Complete guide
- **[ADULT_TUBE_MODE_SETUP.md](ADULT_TUBE_MODE_SETUP.md)** - Adult mode setup
- **[docs/UNCENSORED_LLM_SETUP.md](docs/UNCENSORED_LLM_SETUP.md)** - LLM guide

## 🎉 Ready to Deploy!

Follow the quick start guide and you'll be running in minutes!

**Access**: `http://your-droplet-ip:3000`
