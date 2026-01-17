# Migration from Ollama to Gemini 3.0 Flash

## ✅ Changes Made

### 1. Removed Ollama Service
- ✅ Removed `ollama` service from `docker-compose.production.yml`
- ✅ Removed `ollama-data` volume
- ✅ Removed `OLLAMA_API_URL` environment variable
- ✅ Removed Ollama dependency from `desirefinder` service

### 2. Updated Default Models
- ✅ Changed default provider from `ollama` to `gemini`
- ✅ Updated `src/lib/config/defaultModels.ts` to use Gemini API
- ✅ Set default chat model to `gemini-3-flash-preview`
- ✅ Set default embedding model to `text-embedding-004`

### 3. Environment Variables
- ✅ Added `GEMINI_API_KEY` to docker-compose environment
- ✅ Removed `OLLAMA_API_URL` references

### 4. Documentation
- ✅ Updated `README.md` to reflect Gemini instead of Ollama
- ✅ Created `GEMINI_SETUP.md` with setup instructions

## 🚀 Deployment Steps

### On Your Droplet

1. **Stop current containers**:
   ```bash
   docker compose -f docker-compose.production.yml down
   ```

2. **Add Gemini API key to `.env`**:
   ```bash
   echo "GEMINI_API_KEY=your_gemini_api_key_here" >> .env
   ```

3. **Pull latest code** (if using git):
   ```bash
   git pull
   ```

4. **Rebuild and start**:
   ```bash
   docker compose -f docker-compose.production.yml up -d --build
   ```

5. **Verify**:
   - Check logs: `docker logs desirefinder`
   - Visit your site and test a search query
   - Go to Settings → Models and verify "DesireFinder AI (Gemini)" is shown

## 💰 Cost Savings

### Before (Ollama)
- Droplet: $48-96/month (8-16GB RAM for Ollama models)
- Total: $48-96/month

### After (Gemini API)
- Droplet: $12-24/month (2-4GB RAM sufficient)
- Gemini API: ~$0.50 per million input tokens
- Estimated: $20-40/month for moderate usage
- **Total: $32-64/month (33-50% savings)**

## 📊 Resource Requirements

### Minimum Droplet Specs (After Migration)
- **RAM**: 2GB (was 8-16GB)
- **CPU**: 1-2 vCPU (was 4+ vCPU)
- **Storage**: 20GB (was 40GB+ for models)
- **Cost**: ~$12/month (was $48-96/month)

## ⚠️ Important Notes

1. **API Key Required**: You must set `GEMINI_API_KEY` or the app will fail to start
2. **No Local Models**: All AI processing now happens via API
3. **Internet Required**: Droplet must have internet access for API calls
4. **Rate Limits**: Monitor usage in Google AI Studio to avoid hitting limits

## 🔍 Verification Checklist

- [ ] `GEMINI_API_KEY` is set in `.env`
- [ ] Docker containers are running without errors
- [ ] Settings → Models shows "DesireFinder AI (Gemini)"
- [ ] Test search query works
- [ ] No Ollama-related errors in logs

## 🐛 Troubleshooting

### Error: "GEMINI_API_KEY environment variable is required"
**Fix**: Add `GEMINI_API_KEY=your_key` to `.env` and restart containers

### Error: "Error Loading Gemini Chat Model"
**Fix**: 
- Verify API key is valid at https://aistudio.google.com/
- Check model name is correct: `gemini-3-flash-preview`
- Ensure API access is enabled

### High API Costs
**Fix**:
- Review prompt lengths
- Use Flash models (not Pro)
- Implement caching
- Set budget alerts in Google Cloud Console
