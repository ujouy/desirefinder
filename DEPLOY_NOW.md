# 🚀 Deploy DesireFinder Now!

Your files are uploaded! Here's what to do next:

## Step 1: SSH Into Your Droplet

```bash
ssh root@165.232.140.104
```

## Step 2: Navigate to Project

```bash
cd /root/desirefinder
```

## Step 3: Update .env File

```bash
nano .env
```

**Make sure these are set correctly:**

```env
# Database (Supabase) - Already correct!
DATABASE_URL=postgresql://postgres.wtpqkxpyjzfrrvyvvbmc:lS2xp8wirQzN8wMp@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true

# Clerk - Get from https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# NowPayments - Already set!
NOWPAYMENTS_API_KEY=RS7XRMH-06SM0CP-GNEG7ZC-NBW33G9
NOWPAYMENTS_IPN_SECRET=your_ipn_secret_here

# App URL - Update with your domain
NEXT_PUBLIC_APP_URL=https://desirefinder.com

# Search & AI (internal Docker network) - Already correct!
SEARXNG_API_URL=http://searxng:8080
OLLAMA_API_URL=http://ollama:11434
NODE_ENV=production
```

**Save**: `Ctrl+X`, then `Y`, then `Enter`

## Step 4: Deploy!

**Option A: Use the deployment script**

```bash
chmod +x scripts/deploy-on-droplet.sh
./scripts/deploy-on-droplet.sh
```

**Option B: Manual deployment**

```bash
# Start the stack
docker compose -f docker-compose.production.yml up -d --build

# Wait 30 seconds
sleep 30

# Check status
docker compose -f docker-compose.production.yml ps

# Download models (takes 5-10 minutes)
docker exec -it ollama ollama pull dolphin-llama3
docker exec -it ollama ollama pull nomic-embed-text

# Verify models
docker exec -it ollama ollama list
```

## Step 5: Verify Everything Works

```bash
# Check all services are running
docker compose -f docker-compose.production.yml ps

# Check logs
docker compose -f docker-compose.production.yml logs --tail=50

# Test the app
curl http://localhost:3000
```

## Step 6: Access Your App

- **Direct IP**: `http://165.232.140.104:3000`
- **Domain** (after DNS propagates): `https://desirefinder.com`

## 🎉 You're Done!

Your DesireFinder app should now be:
- ✅ Running on the droplet
- ✅ Accessible via IP and domain
- ✅ SSL configured (Caddy)
- ✅ Ready for users!

## 📝 Next Steps

1. **Test the app**: Visit `http://165.232.140.104:3000`
2. **Configure Clerk webhooks**: `https://desirefinder.com/api/webhooks/clerk`
3. **Configure NowPayments webhooks**: `https://desirefinder.com/api/webhooks/nowpayments`
4. **Test signup**: Create a test user
5. **Test payments**: Make a test purchase

## 🐛 Troubleshooting

**Services won't start?**
```bash
docker compose -f docker-compose.production.yml logs
```

**Check specific service:**
```bash
docker compose -f docker-compose.production.yml logs desirefinder
docker compose -f docker-compose.production.yml logs searxng
docker compose -f docker-compose.production.yml logs ollama
```

**Restart a service:**
```bash
docker compose -f docker-compose.production.yml restart desirefinder
```
