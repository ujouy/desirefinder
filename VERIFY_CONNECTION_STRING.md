# 🔍 Verify Your Supabase Connection String

The connection is reaching Supabase but authentication is failing. Let's verify the connection string is correct.

## ✅ Steps to Get the Correct Connection String

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/wtpqkxpyjzfrrvyvvbmc
2. **Click "Connect"** button at the top
3. **Select "Transaction pooler"** tab (port 6543)
4. **Copy the EXACT connection string** shown

## 🔑 Important: Password Handling

The connection string from Supabase will have `[YOUR-PASSWORD]` as a placeholder. You need to:

1. **Get your actual database password**:
   - Go to **Settings** → **Database**
   - Look for **"Database password"** section
   - If you don't remember it, click **"Reset database password"**
   - **Save the new password** if you reset it!

2. **Replace `[YOUR-PASSWORD]`** in the connection string with your actual password

## 📝 Connection String Format

The pooler connection string should look like:

```
postgres://postgres.wtpqkxpyjzfrrvyvvbmc:YOUR_ACTUAL_PASSWORD@aws-0-us-west-2.pooler.supabase.com:6543/postgres
```

**Note**: 
- Uses `postgres://` (not `postgresql://`)
- Username format: `postgres.wtpqkxpyjzfrrvyvvbmc` (includes project ref)
- Port: `6543` (transaction pooler)
- No special characters in password (if your password has special chars, they may need URL encoding)

## 🔧 URL Encoding for Special Characters

If your password contains special characters, they need to be URL-encoded:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- `?` → `%3F`

## ✅ Test Your Connection String

Once you have the correct connection string, update `.env`:

```env
DATABASE_URL=postgres://postgres.wtpqkxpyjzfrrvyvvbmc:YOUR_ACTUAL_PASSWORD@aws-0-us-west-2.pooler.supabase.com:6543/postgres
```

Then test:
```bash
node test-connection.js
```

## 🆘 Still Not Working?

If authentication still fails:

1. **Reset your database password**:
   - Settings → Database → Reset database password
   - Copy the new password
   - Update connection string

2. **Try Session Pooler instead**:
   - In "Connect" modal, try "Session pooler" tab
   - Port 5432
   - Copy that connection string

3. **Check for typos**:
   - Verify password is correct
   - Check username format matches exactly
   - Ensure no extra spaces
