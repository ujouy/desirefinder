# Payment System Setup Guide

Complete guide for setting up the high-risk payment system for DesireFinder SaaS.

## 🎯 Overview

This system uses:
- **Clerk** for authentication (free tier)
- **PostgreSQL** for database (Docker)
- **NowPayments** for crypto payments (high-risk approved)
- **Prisma** for database ORM

## 📋 Prerequisites

1. **Clerk Account**: Sign up at https://clerk.com (free tier)
2. **NowPayments Account**: Sign up at https://nowpayments.io
3. **DigitalOcean Droplet**: With Docker installed
4. **Domain**: For webhooks (desirefinder.com)

## 🔧 Step 1: Clerk Setup

### 1.1 Create Clerk Application

1. Go to https://clerk.com
2. Create new application
3. Choose "Next.js" as framework
4. Copy your keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### 1.2 Configure Webhook

1. In Clerk Dashboard → Webhooks
2. Add endpoint: `https://desirefinder.com/api/webhooks/clerk`
3. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. Copy the **Signing Secret** → `CLERK_WEBHOOK_SECRET`

### 1.3 Add Age Verification (Optional but Recommended)

1. In Clerk Dashboard → User & Authentication
2. Add custom field: `date_of_birth`
3. Add validation: Must be 18+ years old
4. Or use Clerk's built-in age verification

## 🔧 Step 2: NowPayments Setup

### 2.1 Create Account

1. Go to https://nowpayments.io
2. Sign up and verify email
3. Complete KYC (Know Your Customer) verification
4. **Important**: Mention you're building an "AI search engine" - don't mention adult content in application

### 2.2 Get API Keys

1. Dashboard → API Settings
2. Copy:
   - `NOWPAYMENTS_API_KEY` (API Key)
   - `NOWPAYMENTS_IPN_SECRET` (IPN Secret for webhooks)

### 2.3 Configure Webhook

1. Dashboard → IPN Settings
2. Add IPN URL: `https://desirefinder.com/api/webhooks/nowpayments`
3. Enable IPN notifications
4. Save IPN Secret

### 2.4 Enable Payment Methods

1. Dashboard → Payment Methods
2. Enable: Bitcoin, Ethereum, USDT (recommended)
3. Set minimum payment amount (e.g., $5)

## 🔧 Step 3: Database Setup

### 3.1 Environment Variables

Create `.env` file:

```env
# Database
POSTGRES_USER=desirefinder
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=desirefinder
DATABASE_URL=postgresql://desirefinder:your_secure_password_here@postgres:5432/desirefinder

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# NowPayments
NOWPAYMENTS_API_KEY=your_api_key_here
NOWPAYMENTS_IPN_SECRET=your_ipn_secret_here

# App URL (for webhooks)
NEXT_PUBLIC_APP_URL=https://desirefinder.com

# Existing
SEARXNG_API_URL=http://searxng:8080
OLLAMA_API_URL=http://ollama:11434
DEFAULT_CHAT_MODEL=dolphin-llama3
DEFAULT_EMBEDDING_MODEL=nomic-embed-text
```

### 3.2 Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Or in production
npx prisma migrate deploy
```

## 🔧 Step 4: Deploy Stack

### 4.1 Update Docker Compose

The `docker-compose.production.yml` already includes PostgreSQL. Just ensure your `.env` file is in the same directory.

### 4.2 Start Services

```bash
docker compose -f docker-compose.production.yml up -d
```

### 4.3 Verify

```bash
# Check all services
docker compose -f docker-compose.production.yml ps

# Check PostgreSQL
docker exec -it postgres psql -U desirefinder -d desirefinder -c "SELECT COUNT(*) FROM \"User\";"

# Check logs
docker compose -f docker-compose.production.yml logs -f desirefinder
```

## 🔧 Step 5: Test Payment Flow

### 5.1 Test User Registration

1. Visit https://desirefinder.com
2. Sign up with Clerk
3. Check database: User should be created with 3 free credits
4. Check webhook logs in Clerk dashboard

### 5.2 Test Payment

1. Go to `/pricing`
2. Click "Buy with Crypto" on Explorer package
3. Should redirect to NowPayments payment page
4. Use test payment (if available) or small real payment
5. Check webhook: Credits should be added automatically

### 5.3 Test Credit System

1. Make a search (should deduct 1 credit)
2. Check credit balance in navbar
3. When credits = 0, search should return 402 error
4. Purchase credits → search should work again

## 📊 Database Schema

### User Table
- `id`: UUID (primary key)
- `clerkId`: String (unique, matches Clerk user ID)
- `email`: String (unique)
- `credits`: Int (default: 3)
- `isPremium`: Boolean (default: false)

### Transaction Table
- `id`: UUID (primary key)
- `userId`: Foreign key to User
- `amount`: Float (USD value)
- `creditsAdded`: Int
- `status`: String (PENDING, COMPLETED, FAILED)
- `paymentId`: String (NowPayments payment ID)

## 🔒 Security Checklist

- [ ] PostgreSQL password is strong and unique
- [ ] `.env` file is not committed to git
- [ ] Clerk webhook secret is set correctly
- [ ] NowPayments IPN secret is set correctly
- [ ] HTTPS is enabled (required for webhooks)
- [ ] Database backups are configured
- [ ] Age verification is enabled in Clerk

## 🐛 Troubleshooting

### Webhook Not Working

1. Check webhook URL is accessible (HTTPS required)
2. Verify webhook secret matches
3. Check Clerk/NowPayments dashboard for error logs
4. Test webhook endpoint manually

### Payment Not Processing

1. Check NowPayments API key is correct
2. Verify IPN webhook URL is accessible
3. Check transaction status in database
4. Review NowPayments dashboard for payment status

### Credits Not Adding

1. Check webhook is receiving events
2. Verify transaction status is "COMPLETED"
3. Check database: User credits should increment
4. Review application logs

## 📝 Legal Compliance

### Age Gate
- Configured in Clerk (date_of_birth field)
- Users must be 18+ to sign up

### 2257 Statement
- Available at `/legal/2257`
- States DesireFinder is a search engine, not content producer

### DMCA Policy
- Available at `/legal/dmca`
- Form for copyright holders to request link removal

## 🚀 Production Checklist

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Clerk webhook configured and tested
- [ ] NowPayments webhook configured and tested
- [ ] Payment flow tested end-to-end
- [ ] Credit system working correctly
- [ ] Legal pages accessible
- [ ] Age verification enabled
- [ ] HTTPS enabled
- [ ] Database backups configured
- [ ] Monitoring/logging set up

## 💰 Pricing Packages

Currently configured:
- **Voyeur (Trial)**: 3 credits, Free
- **Explorer**: 50 credits, $5
- **Collector**: 200 credits, $15

To modify, edit `src/app/api/payments/create/route.ts` → `PACKAGES` constant.

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [NowPayments API Docs](https://documenter.getpostman.com/view/7907941/T1LJjU52)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
