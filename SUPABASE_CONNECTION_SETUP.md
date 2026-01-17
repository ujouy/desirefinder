# ✅ Supabase Connection Setup

Your Supabase project is ready! Here's how to complete the connection.

## 🎯 Your Supabase Project

- **Project Name**: desirefinder
- **Project ID**: wtpqkxpyjzfrrvyvvbmc
- **Database Host**: db.wtpqkxpyjzfrrvyvvbmc.supabase.co
- **Region**: us-west-2
- **Status**: ✅ ACTIVE_HEALTHY

## ✅ Database Tables Created

All tables have been created successfully:
- ✅ User
- ✅ Transaction
- ✅ AffiliateClick
- ✅ Chat
- ✅ Message
- ✅ Video

## 🔧 Get Your Connection String

1. Go to https://supabase.com/dashboard/project/wtpqkxpyjzfrrvyvvbmc
2. Click **Settings** → **Database**
3. Scroll to **Connection string**
4. Click the **URI** tab
5. Copy the connection string

It will look like:
```
postgresql://postgres:[YOUR-PASSWORD]@db.wtpqkxpyjzfrrvyvvbmc.supabase.co:5432/postgres
```

**Important**: Replace `[YOUR-PASSWORD]` with your actual database password (the one you set when creating the project).

## 📝 Update .env File

Update your `.env` file with the connection string:

```env
DATABASE_URL=postgresql://postgres:your_actual_password@db.wtpqkxpyjzfrrvyvvbmc.supabase.co:5432/postgres
```

## 🚀 Final Steps

After updating `.env`, run:

```bash
# Generate Prisma client
npm run db:generate

# Verify connection (optional)
npm run db:studio
```

## ✅ Done!

Your Supabase database is fully set up and ready to use!

**Next Steps:**
1. Get connection string from Supabase dashboard
2. Update `.env` with your password
3. Run `npm run db:generate`
4. Start your app!
