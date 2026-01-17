# 🔧 Supabase Connection String Fix

The direct connection isn't working (likely IPv6 issue on Windows). Let's use Supabase's **Connection Pooler** instead.

## 🔗 Get Pooler Connection String

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/wtpqkxpyjzfrrvyvvbmc
2. Click **"Connect"** button at the top
3. In the modal, you'll see multiple connection options:
   - **Direct connection** (port 5432) - requires IPv6
   - **Session pooler** (port 5432) - works with IPv4
   - **Transaction pooler** (port 6543) - best for Prisma

4. **Select "Transaction pooler"** tab
5. Copy the connection string

It will look like:
```
postgres://postgres.wtpqkxpyjzfrrvyvvbmc:[YOUR-PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres
```

## 📝 Update .env

Replace your current `DATABASE_URL` with the pooler connection string:

```env
DATABASE_URL=postgres://postgres.wtpqkxpyjzfrrvyvvbmc:MXXhdF5GpIFdETtr@aws-0-us-west-2.pooler.supabase.com:6543/postgres
```

**Note**: 
- Replace `[YOUR-PASSWORD]` with `MXXhdF5GpIFdETtr`
- The format uses `postgres://` (not `postgresql://`)
- Port is `6543` (transaction pooler)
- Host is `aws-0-us-west-2.pooler.supabase.com` (your region pooler)

## ✅ Why Use Pooler?

- ✅ Works with IPv4 (Windows compatible)
- ✅ Better for Prisma (handles connection pooling)
- ✅ More reliable for serverless/edge functions
- ✅ Recommended by Supabase for Prisma

## 🚀 After Updating

Test the connection:

```bash
node test-connection.js
```

Or use Prisma Studio:

```bash
npm run db:studio
```
