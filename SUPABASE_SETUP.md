# Supabase Setup Guide

Complete guide for using Supabase (cloud-hosted PostgreSQL) instead of self-hosted database.

## 🎯 Why Supabase?

- ✅ **Free Tier**: 500MB database, 2GB bandwidth
- ✅ **Managed**: No database maintenance
- ✅ **Auto-scaling**: Handles traffic spikes
- ✅ **Built-in Auth**: Can replace Clerk (optional)
- ✅ **Real-time**: Built-in real-time subscriptions
- ✅ **Backups**: Automatic daily backups

## 🔧 Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up (free tier is fine)
3. Click "New Project"
4. Fill in:
   - **Name**: DesireFinder
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to you
5. Click "Create new project"
6. Wait 2-3 minutes for setup

## 🔧 Step 2: Get Database Connection String

1. In Supabase Dashboard → **Settings → Database**
2. Scroll to **Connection string**
3. Select **URI** tab
4. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password

## 🔧 Step 3: Update .env File

Update your `.env` file:

```env
# Supabase Database (replace with your connection string)
DATABASE_URL=postgresql://postgres:your_password@db.xxxxx.supabase.co:5432/postgres

# Remove these (not needed with Supabase):
# POSTGRES_USER=...
# POSTGRES_PASSWORD=...
# POSTGRES_DB=...
```

## 🔧 Step 4: Run Database Migrations

```bash
# Generate Prisma client
npm run db:generate

# Run migrations to create tables
npm run db:migrate
```

This will create all tables in your Supabase database:
- User
- Transaction
- AffiliateClick
- Chat
- Message
- Video

## 🔧 Step 5: Verify Connection

```bash
# Open Prisma Studio to view your database
npm run db:studio
```

This opens a GUI at http://localhost:5555 where you can:
- View all tables
- See data
- Edit records

## 🔧 Step 6: Update Docker Compose (Optional)

Since we're using Supabase, you can remove PostgreSQL from docker-compose:

The `docker-compose.production.yml` has already been updated to remove the local PostgreSQL container.

## 🔧 Step 7: Test Database Connection

Create a test script:

```bash
# Test connection
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => console.log('✅ Connected to Supabase!'))
  .catch(err => console.error('❌ Connection failed:', err))
  .finally(() => prisma.\$disconnect());
"
```

## 📊 Supabase Dashboard Features

### View Data
1. Go to Supabase Dashboard → **Table Editor**
2. See all your tables
3. View/edit data directly

### SQL Editor
1. Go to **SQL Editor**
2. Run custom queries:
   ```sql
   SELECT COUNT(*) FROM "User";
   SELECT * FROM "Transaction" ORDER BY "createdAt" DESC LIMIT 10;
   ```

### API Access
Supabase also provides REST and GraphQL APIs (optional):
- **REST API**: `https://xxxxx.supabase.co/rest/v1/`
- **GraphQL API**: `https://xxxxx.supabase.co/graphql/v1`

## 🔒 Security Best Practices

1. **Connection Pooling**: Supabase handles this automatically
2. **SSL Required**: Connection string includes SSL
3. **Row Level Security**: Can be enabled in Supabase dashboard
4. **API Keys**: Keep your Supabase keys secure

## 💰 Supabase Pricing

**Free Tier** (Perfect for MVP):
- 500MB database
- 2GB bandwidth/month
- 2GB file storage
- 50,000 monthly active users

**Pro Tier** ($25/month):
- 8GB database
- 250GB bandwidth/month
- 100GB file storage
- Unlimited users

## 🔄 Migration from Local PostgreSQL

If you already have data in local PostgreSQL:

1. Export data:
   ```bash
   pg_dump -U desirefinder desirefinder > backup.sql
   ```

2. Import to Supabase:
   - Use Supabase SQL Editor
   - Or use `psql` with your Supabase connection string

## 🐛 Troubleshooting

### Connection Timeout
- Check firewall allows Supabase IPs
- Verify connection string is correct
- Check database password

### Migration Errors
- Ensure Prisma schema matches Supabase
- Check for existing tables (may need to drop first)
- Review Supabase logs in dashboard

### SSL Errors
- Supabase requires SSL
- Connection string should include `?sslmode=require`
- Prisma handles this automatically

## ✅ Benefits Over Self-Hosted

- ✅ No database maintenance
- ✅ Automatic backups
- ✅ Built-in monitoring
- ✅ Easy scaling
- ✅ Free tier for development
- ✅ No Docker container needed

## 🎉 Done!

Your database is now hosted on Supabase. No need to manage PostgreSQL yourself!

**Next Steps:**
1. Get your Supabase connection string
2. Update `.env` with `DATABASE_URL`
3. Run migrations: `npm run db:migrate`
4. Start your app!
