# .env File Setup Instructions

## ✅ .env File Created

Your `.env` file has been created with the following configuration:

### Already Configured ✅
- **NowPayments API Key**: `RS7XRMH-06SM0CP-GNEG7ZC-NBW33G9` ✅

### Need to Configure 🔧

#### 1. Clerk Authentication Keys
Get these from https://clerk.com:

1. Create account at https://clerk.com
2. Create new application → Choose "Next.js"
3. Copy these 3 values to `.env`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_`)
   - `CLERK_SECRET_KEY` (starts with `sk_`)
   - `CLERK_WEBHOOK_SECRET` (starts with `whsec_`)

**To get webhook secret:**
- In Clerk Dashboard → Webhooks
- Add endpoint: `https://desirefinder.com/api/webhooks/clerk`
- Subscribe to: `user.created`, `user.updated`, `user.deleted`
- Copy the Signing Secret

#### 2. NowPayments IPN Secret
Get this from https://nowpayments.io:

1. Login to NowPayments dashboard
2. Go to **Settings → IPN Settings**
3. Copy your **IPN Secret Key**
4. Replace `replace_with_your_ipn_secret_from_nowpayments` in `.env`

**Configure IPN Webhook:**
- Add IPN URL: `https://desirefinder.com/api/webhooks/nowpayments`
- Enable IPN notifications
- Save IPN Secret

#### 3. Database Password
Replace `change_me_in_production_use_strong_password` with a strong password:

```env
POSTGRES_PASSWORD=your_secure_password_here
DATABASE_URL=postgresql://desirefinder:your_secure_password_here@postgres:5432/desirefinder
```

#### 4. Production URL
When deploying to production, change:

```env
NEXT_PUBLIC_APP_URL=https://desirefinder.com
```

## 📝 Current .env File Location

Your `.env` file is located at: `D:\DesireFinder\.env`

## 🔒 Security Notes

- ✅ `.env` is already in `.gitignore` (won't be committed)
- ⚠️ Never commit API keys to git
- ⚠️ Use strong passwords in production
- ⚠️ Rotate keys if exposed

## ✅ Next Steps

1. **Get Clerk Keys** → Add to `.env`
2. **Get NowPayments IPN Secret** → Add to `.env`
3. **Set Database Password** → Update in `.env`
4. **Run Migrations**: `npm run db:generate && npm run db:migrate`
5. **Start Services**: `docker compose -f docker-compose.production.yml up -d`

## 🧪 Test Configuration

After setting up all keys, test:

```bash
# Check environment variables are loaded
node -e "require('dotenv').config(); console.log('NowPayments Key:', process.env.NOWPAYMENTS_API_KEY ? 'Set ✅' : 'Missing ❌')"
```

## 📚 Documentation

- **Quick Start**: `QUICK_START_PAYMENTS.md`
- **NowPayments Setup**: `NOWPAYMENTS_SETUP.md`
- **Full Guide**: `PAYMENT_SETUP_GUIDE.md`
