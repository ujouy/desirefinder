# 🔗 How to Get Your Supabase Connection String

## Quick Method: Click "Connect" Button

1. **At the top of your Supabase dashboard**, you'll see a **"Connect"** button
2. Click **"Connect"**
3. A modal will open showing connection options
4. Select **"URI"** tab
5. Copy the connection string

The connection string will look like:
```
postgresql://postgres:[YOUR-PASSWORD]@db.wtpqkxpyjzfrrvyvvbmc.supabase.co:5432/postgres
```

## Alternative: From Database Settings

1. Go to **Settings** → **Database** (you're already here!)
2. Scroll down to find **"Connection string"** section
3. Click the **"URI"** tab
4. Copy the connection string

## 🔑 Important: Replace Password Placeholder

The connection string will have `[YOUR-PASSWORD]` as a placeholder. You need to:

1. **Get your database password**:
   - In the Database Settings page, look for **"Database password"** section
   - Click **"Reset database password"** if you don't remember it
   - Or use the password you set when creating the project

2. **Replace `[YOUR-PASSWORD]`** in the connection string with your actual password

## 📝 Example

If your password is `MySecurePassword123`, your connection string should be:
```
postgresql://postgres:MySecurePassword123@db.wtpqkxpyjzfrrvyvvbmc.supabase.co:5432/postgres
```

## ✅ Update Your .env File

Once you have the connection string with your actual password, update your `.env` file:

```env
DATABASE_URL=postgresql://postgres:your_actual_password@db.wtpqkxpyjzfrrvyvvbmc.supabase.co:5432/postgres
```

## 🚀 After Updating .env

Run these commands to verify everything works:

```bash
# Test connection
npm run db:studio
```

This will open Prisma Studio where you can see all your tables!
