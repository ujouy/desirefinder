# Gemini 3.0 Flash Setup Guide

## 🎯 Overview

DesireFinder uses **Gemini 3.0 Flash API** for cost-effective AI processing. This eliminates the need for expensive local GPU infrastructure (like Ollama) and reduces droplet costs significantly.

## ✨ Benefits

- **Lower Infrastructure Costs**: No need for high-memory droplets to run local LLMs
- **Pay-Per-Use**: Only pay for API calls, not 24/7 server resources
- **Scalable**: Automatically scales with usage
- **Fast**: Gemini 3.0 Flash is optimized for speed and low latency
- **Large Context Window**: 1M+ input tokens, 65K+ output tokens

## 🔧 Setup Instructions

### Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" or go to [API Keys page](https://aistudio.google.com/app/apikey)
4. Create a new API key
5. Copy the API key

### Step 2: Configure Environment Variables

Add to your `.env` file:

```bash
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Override default models
DEFAULT_CHAT_MODEL=gemini-3-flash-preview
DEFAULT_EMBEDDING_MODEL=text-embedding-004
```

### Step 3: Update Docker Compose

The `docker-compose.production.yml` has been updated to remove Ollama. Make sure your environment variables are set:

```bash
# In docker-compose.production.yml or .env
GEMINI_API_KEY=${GEMINI_API_KEY}
```

### Step 4: Deploy

```bash
# Rebuild and restart containers
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d --build
```

## 📊 Model Information

### Available Gemini Models

**Chat Models:**
- `gemini-3-flash-preview` - Latest Gemini 3.0 Flash (recommended)
- `gemini-2.0-flash-exp` - Gemini 2.0 Flash experimental
- `gemini-1.5-flash` - Stable Gemini 1.5 Flash
- `gemini-1.5-pro` - Higher quality (more expensive)

**Embedding Models:**
- `text-embedding-004` - Latest embedding model (recommended)
- `text-embedding-003` - Previous generation

### Pricing (as of 2025)

- **Gemini 3.0 Flash**: 
  - Input: ~$0.50 per million tokens
  - Output: ~$3 per million tokens
- **Context Window**: 1,048,576 input tokens / 65,536 output tokens

## 🔍 Verification

After setup, verify the configuration:

1. Open DesireFinder at `http://your-domain.com`
2. Go to Settings → Models
3. You should see "DesireFinder AI (Gemini)" as the default provider
4. Try a search query to verify it's working

## 💰 Cost Optimization Tips

1. **Use Flash for Most Tasks**: Flash is fast and cost-effective
2. **Optimize Prompts**: Shorter prompts = lower costs
3. **Cache Context**: Reuse context where possible
4. **Monitor Usage**: Track token usage in Google AI Studio dashboard
5. **Set Budget Alerts**: Configure spending limits in Google Cloud Console

## 🚨 Troubleshooting

### "GEMINI_API_KEY environment variable is required"

**Solution**: Make sure you've set `GEMINI_API_KEY` in your `.env` file and restarted Docker containers.

### "Error Loading Gemini Chat Model"

**Solution**: 
- Verify your API key is valid
- Check that the model name is correct (e.g., `gemini-3-flash-preview`)
- Ensure you have API access enabled in Google AI Studio

### High API Costs

**Solution**:
- Review your prompt lengths
- Use Flash instead of Pro models
- Implement caching for repeated queries
- Set up budget alerts in Google Cloud Console

## 📝 Notes

- Gemini 3.0 Flash is currently in **public preview** (as of Dec 2025)
- Preview status may mean quotas or changing pricing
- Monitor Google AI Studio for updates and announcements
- The system automatically falls back to configured models if API calls fail

## 🔄 Migration from Ollama

If you were previously using Ollama:

1. ✅ Ollama service removed from `docker-compose.production.yml`
2. ✅ Default models updated to use Gemini
3. ✅ Environment variables updated
4. ✅ No code changes needed - Gemini provider already integrated

Your droplet can now be smaller (no need for 12GB+ RAM for Ollama models).
