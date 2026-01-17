# Quick Guide: Get OpenService AliExpress Access Token

## 🎯 Fastest Method: Token Query Tool

1. **Go to OpenService Dashboard**: https://open.aliexpress.com
2. **Click "Token Query Tool"** (in left sidebar under "Common Tools")
3. **Generate or View Token**
4. **Copy the access token**
5. **Add to `.env.production`**

**That's it!** If this tool is available, use it - it's the easiest way.

---

## 🔄 Alternative: OAuth Flow (If Token Query Tool Not Available)

### Step 1: Generate Authorization URL

Visit this URL on your server (or use the API endpoint):

```
http://138.68.42.224/api/dropshipping/aliexpress/authorize
```

Or manually construct:
```
https://auth.aliexpress.com/oauth/authorize?response_type=code&client_id=525062&redirect_uri=https://desirefinder.com/api/dropshipping/aliexpress/callback&state=desirefinder_2026
```

### Step 2: Authorize the App

1. **Open the authorization URL** in your browser
2. **Login to AliExpress** (if needed)
3. **Click "Authorize"** or "Allow"
4. **You'll be redirected** to your callback URL with `?code=AUTHORIZATION_CODE`

### Step 3: Get Access Token

The callback endpoint will automatically:
- Exchange the code for an access token
- Display it in the URL or logs
- You can copy it from there

### Step 4: Add to .env.production

```env
ALIEXPRESS_ACCESS_TOKEN=your_token_here
```

---

## 🛠️ Using the Helper Endpoint

I've created a helper endpoint to generate the authorization URL:

**Visit:**
```
http://138.68.42.224/api/dropshipping/aliexpress/authorize
```

**Response:**
```json
{
  "authorizationUrl": "https://auth.aliexpress.com/oauth/authorize?...",
  "instructions": [...],
  "appKey": "525062",
  "redirectUri": "https://desirefinder.com/api/dropshipping/aliexpress/callback"
}
```

Copy the `authorizationUrl` and open it in your browser.

---

## 📝 Your Current Credentials

From your dashboard:
- **AppKey**: `525062`
- **AppSecret**: `YQECONEWTOP3DnthhWPFIRSTE3Qv`
- **Access Token**: Get from Token Query Tool or OAuth flow

---

## ⚠️ Important Notes

1. **Test Mode**: Your app is in "Test" status - tokens work but may have limitations
2. **Token Expiration**: Access tokens expire - check expiration time
3. **Refresh Token**: Save refresh token to get new access tokens without re-authorizing
4. **Production**: Switch app to "Production" status when ready

---

## 🚀 Quick Start

**Try this first:**
1. OpenService Dashboard → "Token Query Tool" → Get token
2. If not available → Use OAuth flow above
3. Add token to `.env.production`
4. Restart your app: `docker compose restart app`
