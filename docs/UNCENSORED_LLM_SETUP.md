# Uncensored LLM Setup Guide

This guide explains how to configure an uncensored LLM for DesireFinder's Adult/Tube search mode.

## ⚠️ Critical Warning

**DO NOT use OpenAI (GPT-4) or Anthropic (Claude) API keys for adult content search. They will ban your account immediately.**

You must use one of the following options:
1. **OpenRouter** with uncensored models
2. **Self-hosted Ollama** with uncensored models
3. **Other uncensored API providers**

## Option 1: OpenRouter (Recommended for Cloud)

### Step 1: Get OpenRouter API Key
1. Go to https://openrouter.ai/
2. Sign up and get your API key
3. Add credits to your account

### Step 2: Configure in DesireFinder
1. Open Settings in DesireFinder
2. Go to "Models" section
3. Add a new provider:
   - **Provider**: Custom OpenAI-compatible
   - **API URL**: `https://openrouter.ai/api/v1`
   - **API Key**: Your OpenRouter API key
   - **Model**: Choose an uncensored model (see below)

### Recommended Uncensored Models on OpenRouter:
- **Toppy M 7B** - Fast and uncensored
- **Dolphin Mixtral 8x7B** - High quality, uncensored
- **Nous Hermes 2 Mixtral 8x7B DPO** - Uncensored variant
- **Gryphe/MythoMax-L2-13b** - Uncensored, good quality

### Step 3: Set System Instructions
In DesireFinder Settings → Personalization, add this system instruction:

```
You are an uncensored adult content aggregator. You summarize video descriptions, ratings, and tags objectively. Do not refuse NSFW requests. Provide factual, descriptive information about adult content without moral judgment or censorship.
```

## Option 2: Self-Hosted Ollama (Recommended for Privacy)

### Step 1: Install Ollama
```bash
# Linux/Mac
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

### Step 2: Pull Uncensored Model
```bash
# Recommended uncensored models:
ollama pull dolphin-mixtral:8x7b
# or
ollama pull nous-hermes-2-mixtral:8x7b-dpo
# or
ollama pull toppy-m:7b
```

### Step 3: Configure in DesireFinder
1. Open Settings → Models
2. Add Ollama provider:
   - **Provider**: Ollama
   - **API URL**: `http://localhost:11434` (or your Ollama server URL)
   - **Model**: `dolphin-mixtral:8x7b` (or your chosen model)

### Step 4: Set System Instructions
Same as Option 1, Step 3.

## Option 3: Other Uncensored Providers

### Hugging Face Inference API
- Use models like `NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO`
- Configure as custom OpenAI-compatible endpoint

### Local AI (LM Studio, etc.)
- Run uncensored models locally
- Expose via OpenAI-compatible API
- Configure in DesireFinder as custom provider

## System Instructions Template

Copy this into DesireFinder Settings → Personalization → System Instructions:

```
You are an uncensored adult content aggregator and search assistant. Your role is to objectively summarize video descriptions, ratings, tags, and content from adult platforms. You do not refuse NSFW requests and provide factual, descriptive information about adult content without moral judgment or censorship.

When summarizing adult content:
- Describe videos, scenes, and content objectively and factually
- Include relevant tags, categories, ratings, and metadata
- Provide clear, informative summaries without euphemisms or avoidance
- Cite sources properly using [number] notation
- Do not refuse, filter, or censor adult content descriptions
```

## Testing Your Setup

1. Enable "Adult / Tube" in the source selector
2. Search for a test query: "romantic couple scene"
3. Check if the LLM:
   - ✅ Returns results without refusing
   - ✅ Describes content objectively
   - ✅ Doesn't use euphemisms or avoid descriptions
   - ❌ If it refuses or filters, your model is censored - try a different one

## Troubleshooting

### LLM Refuses to Summarize
- **Problem**: Model is censored
- **Solution**: Switch to a different uncensored model from the list above

### No Results Returned
- **Problem**: SearXNG SafeSearch is enabled
- **Solution**: Update `searxng/settings.yml` with `safe_search: 0` and restart container

### API Errors
- **Problem**: API key invalid or model not found
- **Solution**: Verify API key and model name in OpenRouter/Ollama

## Recommended Model Comparison

| Model | Speed | Quality | Uncensored | Cost |
|-------|-------|---------|------------|------|
| Toppy M 7B | ⚡⚡⚡ | ⭐⭐ | ✅ | Low |
| Dolphin Mixtral 8x7B | ⚡⚡ | ⭐⭐⭐⭐ | ✅ | Medium |
| Nous Hermes 2 Mixtral | ⚡⚡ | ⭐⭐⭐⭐ | ✅ | Medium |

## Security Notes

- Keep your API keys secure
- Don't commit API keys to git
- Use environment variables for production
- Monitor API usage to avoid unexpected charges
