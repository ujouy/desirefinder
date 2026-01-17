# Quick Start: Payment System Setup

**5-minute guide to activate payments on DesireFinder**

## ✅ You Already Have

- ✅ NowPayments API Key: `RS7XRMH-06SM0CP-GNEG7ZC-NBW33G9`

## 🔧 Step 1: Get NowPayments IPN Secret (2 minutes)

1. Go to https://nowpayments.io
2. Login to your dashboard
3. Navigate to **Settings → IPN Settings**
4. Copy your **IPN Secret Key**
5. Save it - you'll need it for `.env`

## 🔧 Step 2: Get Clerk Keys (3 minutes)

1. Go to https://clerk.com
2. Create account (free tier is fine)
3. Create new application → Choose "Next.js"
4. Copy these 3 keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_`)
   - `CLERK_SECRET_KEY` (starts with `sk_`)
   - `CLERK_WEBHOOK_SECRET` (starts with `whsec_`)

### Configure Clerk Webhook:

1. In Clerk Dashboard → **Webhooks**
2. Add endpoint: `https://desirefinder.com/api/webhooks/clerk`
3. Subscribe to:
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. Copy the **Signing Secret** → This is your `CLERK_WEBHOOK_SECRET`

## 🔧 Step 3: Create .env File

Create `.env` in project root:

```env
# Database
POSTGRES_USER=desirefinder
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=desirefinder
DATABASE_URL=postgresql://desirefinder:your_secure_password_here@postgres:5432/desirefinder

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...your_key_here
CLERK_SECRET_KEY=sk_test_...your_key_here
CLERK_WEBHOOK_SECRET=whsec_...your_webhook_secret_here

# NowPayments
NOWPAYMENTS_API_KEY=RS7XRMH-06SM0CP-GNEG7ZC-NBW33G9
NOWPAYMENTS_IPN_SECRET=your_ipn_secret_from_step_1

# App URL
NEXT_PUBLIC_APP_URL=https://desirefinder.com

# Search & AI
SEARXNG_API_URL=http://searxng:8080
OLLAMA_API_URL=http://ollama:11434
DEFAULT_CHAT_MODEL=dolphin-llama3
DEFAULT_EMBEDDING_MODEL=nomic-embed-text
NODE_ENV=production
```

## 🔧 Step 4: Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate
```

## 🔧 Step 5: Configure NowPayments Webhook

1. Go to NowPayments Dashboard → **IPN Settings**
2. Add IPN URL: `https://desirefinder.com/api/webhooks/nowpayments`
3. Enable IPN notifications
4. Save your IPN Secret (use this in `.env`)

## 🔧 Step 6: Deploy

```bash
# Start all services
docker compose -f docker-compose.production.yml up -d

# Check status
docker compose -f docker-compose.production.yml ps
```

## ✅ Test Payment Flow

1. **Sign Up**: Visit your site → Sign up with Clerk
2. **Check Credits**: Should see 3 free credits in navbar
3. **Make Search**: Should work (1 credit deducted)
4. **Buy Credits**: Go to `/pricing` → Click "Buy with Crypto"
5. **Complete Payment**: Pay with crypto on NowPayments
6. **Verify**: Credits should auto-add after payment

## 🐛 Troubleshooting

### Payment Not Working?
- Check `NOWPAYMENTS_API_KEY` is correct
- Verify IPN webhook URL is accessible (HTTPS required)
- Check NowPayments dashboard for payment status

### Credits Not Adding?
- Check webhook is receiving events (NowPayments dashboard)
- Verify `NOWPAYMENTS_IPN_SECRET` matches
- Check database: `SELECT * FROM "Transaction" ORDER BY "createdAt" DESC;`

### User Not Created?
- Check Clerk webhook is configured
- Verify `CLERK_WEBHOOK_SECRET` matches
- Check webhook logs in Clerk dashboard

## 🎉 Done!

Your payment system is now active. Users can:
- Sign up and get 3 free credits
- Search (1 credit per search)
- Buy more credits with crypto
- Credits auto-add after payment

**Next**: Set up email notifications and monitoring (optional).
