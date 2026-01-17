# OpenService AliExpress OAuth Flow - Complete Guide

## 📋 Overview

OpenService AliExpress uses **OAuth 2.0** to get an access token. You need to complete an authorization flow to get your access token.

---

## ✅ What You Already Have

From your OpenService dashboard:
- **AppKey**: `525062`
- **AppSecret**: `YQECONEWTOP3DnthhWPFIRSTE3Qv`
- **App Status**: Test (approved!)

---

## 🔄 Step-by-Step OAuth Flow

### Step 1: Generate Authorization URL

You need to create an authorization URL that will redirect to AliExpress for user authorization.

**Authorization URL Format:**
```
https://auth.aliexpress.com/oauth/authorize?response_type=code&client_id=YOUR_APP_KEY&redirect_uri=YOUR_CALLBACK_URL&state=random_string
```

**For DesireFinder:**
```
https://auth.aliexpress.com/oauth/authorize?response_type=code&client_id=525062&redirect_uri=https://desirefinder.com/api/dropshipping/aliexpress/callback&state=desirefinder_2026
```

### Step 2: Visit Authorization URL

1. **Copy the authorization URL above** (or generate it using the helper script)
2. **Open it in your browser**
3. **Login to AliExpress** (if not already logged in)
4. **Authorize the app** - Click "Authorize" or "Allow"
5. **You'll be redirected** to: `https://desirefinder.com/api/dropshipping/aliexpress/callback?code=AUTHORIZATION_CODE&state=desirefinder_2026`

### Step 3: Exchange Code for Token

Your callback endpoint (`/api/dropshipping/aliexpress/callback`) will automatically:
1. Receive the authorization code
2. Exchange it for an access token
3. Display the token (or you can check server logs)

### Step 4: Save the Access Token

Copy the access token from the response and add to `.env.production`:
```env
ALIEXPRESS_ACCESS_TOKEN=your_access_token_here
```

---

## 🛠️ Quick Helper: Generate Authorization URL

I'll create a helper page you can use to generate the authorization URL easily.

---

## 📝 Important Notes

1. **Authorization Code Expires**: The code from Step 2 expires quickly (usually 10 minutes)
2. **Access Token Expires**: Access tokens may expire (check expiration time in response)
3. **Refresh Token**: Use refresh token to get new access tokens without re-authorizing
4. **Test Mode**: Your app is in "Test" status - you may need to switch to "Production" later

---

## 🔍 Alternative: Token Query Tool

If OpenService provides a "Token Query Tool" in the dashboard:
1. Go to "Common Tools" → "Token Query Tool"
2. Generate or view your access token directly
3. Copy and add to `.env.production`

This is easier than OAuth flow if available!

---

## 🚀 Next Steps

1. Try the "Token Query Tool" first (easiest)
2. If not available, complete the OAuth flow above
3. Add token to `.env.production`
4. Test the API integration
