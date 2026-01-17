# Quick Start: Supabase Setup

**3-minute guide to set up Supabase database**

## ✅ Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up (free)
3. Click "New Project"
4. Name: **DesireFinder**
5. Generate database password (save it!)
6. Choose region
7. Click "Create new project"
8. Wait 2-3 minutes

## ✅ Step 2: Get Connection String

1. In Supabase Dashboard → **Settings → Database**
2. Scroll to **Connection string**
3. Click **URI** tab
4. Copy the connection string
5. It looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

## ✅ Step 3: Update .env

Open `.env` and replace `DATABASE_URL`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

Replace:
- `YOUR_PASSWORD` with your Supabase database password
- The rest should match your connection string

## ✅ Step 4: Run Migrations

```bash
# Generate Prisma client
npm run db:generate

# Create all tables in Supabase
npm run db:migrate
```

## ✅ Step 5: Verify

```bash
# Open Prisma Studio
npm run db:studio
```

Visit http://localhost:5555 to see your database tables.

## 🎉 Done!

Your database is now on Supabase. No Docker PostgreSQL needed!

**Benefits:**
- ✅ Free tier (500MB)
- ✅ Automatic backups
- ✅ No maintenance
- ✅ Easy to scale

See `SUPABASE_SETUP.md` for detailed guide.
