# 🔗 Get Exact Connection String from Supabase

The authentication is failing. Let's get the **exact** connection string from Supabase dashboard.

## 📋 Step-by-Step Instructions

### 1. Go to Supabase Dashboard
Visit: https://supabase.com/dashboard/project/wtpqkxpyjzfrrvyvvbmc

### 2. Click "Connect" Button
- At the top of the page, click the **"Connect"** button
- A modal will open with connection options

### 3. Select "Transaction pooler" Tab
- Click the **"Transaction pooler"** tab
- Port should be **6543**

### 4. Copy the Connection String
- You'll see a connection string that looks like:
  ```
  postgres://postgres.wtpqkxpyjzfrrvyvvbmc:[YOUR-PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres
  ```

### 5. Replace Password Placeholder
- **IMPORTANT**: The connection string shows `[YOUR-PASSWORD]` as a placeholder
- You need to replace it with your **actual database password**

### 6. Get Your Database Password
If you're not sure of your password:

1. Go to **Settings** → **Database**
2. Scroll to **"Database password"** section
3. Click **"Reset database password"**
4. **Copy the new password** (save it somewhere safe!)
5. Use this **new password** in the connection string

### 7. Final Connection String Format
After replacing `[YOUR-PASSWORD]`, it should look like:
```
postgres://postgres.wtpqkxpyjzfrrvyvvbmc:YOUR_ACTUAL_PASSWORD_HERE@aws-0-us-west-2.pooler.supabase.com:6543/postgres
```

## ✅ Update .env File

Once you have the connection string with the correct password:

1. Open `.env` file
2. Find `DATABASE_URL=`
3. Replace the entire line with your connection string
4. Save the file

## 🧪 Test Connection

```bash
node test-connection.js
```

## 🔍 Common Issues

1. **Password has special characters**: May need URL encoding
2. **Password was reset**: Old password won't work
3. **Copy-paste error**: Check for extra spaces or characters
4. **Wrong tab**: Make sure you're using "Transaction pooler" not "Direct connection"

## 💡 Pro Tip

After resetting your password, Supabase will show you the connection string with the password already filled in. **Copy that exact string** - it's guaranteed to work!
