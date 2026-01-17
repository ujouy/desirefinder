# How to Get OpenService AliExpress Access Token

## 📍 Where to Find Your Access Token

After your OpenService application is **approved** (usually 1-3 business days), follow these steps:

---

## Method 1: Direct Access Token (Most Common for Product APIs)

### Step 1: Login to OpenService Dashboard
1. Go to https://open.aliexpress.com
2. Login with your AliExpress account

### Step 2: Navigate to Your App
1. Click on **"My Apps"** or **"Application Management"**
2. Find your **"DesireFinder"** app
3. Click on it to open app details

### Step 3: Find Your Credentials
In the app details page, you should see:

- **App Key** (also called Client ID or App ID)
  - Location: Usually at the top of the page
  - Format: Usually a long alphanumeric string
  
- **App Secret** (also called Client Secret)
  - Location: Same page, may be hidden (click "Show" or "Reveal")
  - Format: Usually a long alphanumeric string
  
- **Access Token** (may be in one of these places):
  - **Option A**: Directly visible in "Access Token" or "API Token" section
  - **Option B**: In "API Credentials" or "Authentication" section
  - **Option C**: Generated via "Create Token" or "Generate Token" button

### Step 4: Copy the Access Token
- Copy the entire access token string
- It's usually a long JWT token or alphanumeric string
- **Important**: Keep it secret! Don't commit to git.

---

## Method 2: OAuth Flow (If Required)

If your API requires OAuth2 (less common for product search):

### Step 1: Get Authorization Code
1. Visit the authorization URL (check OpenService docs for your API)
2. User/seller authorizes your app
3. Redirects to: `https://desirefinder.com/api/dropshipping/aliexpress/callback?code=AUTH_CODE`

### Step 2: Exchange Code for Token
Your callback endpoint automatically exchanges the code for a token. The token will be in the response:

```json
{
  "access_token": "your_access_token_here",
  "refresh_token": "your_refresh_token_here",
  "expires_in": 3600
}
```

### Step 3: Save the Token
Copy the `access_token` from the response and add to `.env.production`

---

## 🔍 Can't Find the Access Token?

### Check These Places:

1. **App Dashboard**:
   - Look for tabs: "Credentials", "API Keys", "Tokens", "Authentication"
   - Check "Settings" or "Configuration" section

2. **API Documentation**:
   - Check OpenService docs: https://open.aliexpress.com/doc/doc.htm
   - Some APIs provide tokens via API calls, not dashboard

3. **Email Notification**:
   - Check your email for approval notification
   - May contain initial credentials

4. **Contact Support**:
   - If still can't find it, contact OpenService support
   - They can guide you to the exact location

---

## ⚙️ Add to .env.production

Once you have all three values:

```env
# OpenService AliExpress
DROPSHIPPING_API_PROVIDER=openservice-aliexpress
ALIEXPRESS_APP_KEY=your_app_key_here
ALIEXPRESS_APP_SECRET=your_app_secret_here
ALIEXPRESS_ACCESS_TOKEN=your_access_token_here
ALIEXPRESS_API_URL=https://api-sg.aliexpress.com
```

---

## 🧪 Test Your Token

After adding to `.env.production`, test it:

```bash
# On your droplet
docker compose exec app node -e "
const token = process.env.ALIEXPRESS_ACCESS_TOKEN;
console.log('Token exists:', token ? 'Yes ✅' : 'No ❌');
console.log('Token length:', token?.length || 0);
"
```

---

## ⚠️ Important Notes

1. **Token Expiration**: Access tokens may expire. Check OpenService docs for expiration time.
2. **Token Refresh**: If token expires, you may need to:
   - Use refresh token (if provided)
   - Generate new token from dashboard
   - Complete OAuth flow again
3. **Security**: Never commit tokens to git. Always use `.env.production` (which is in `.gitignore`)

---

## 📚 OpenService Resources

- **Dashboard**: https://open.aliexpress.com
- **Documentation**: https://open.aliexpress.com/doc/doc.htm
- **API Reference**: https://open.aliexpress.com/doc/api.htm
- **Support**: Check OpenService support center

---

## 🆘 Still Can't Find It?

If you've checked all the above and still can't find the access token:

1. **Check API Type**: Some APIs don't use access tokens, they use App Key + Signature
2. **Check Documentation**: Your specific API may have different authentication
3. **Contact Support**: OpenService support can help locate your credentials

**Common Issue**: If you just submitted the form, wait for approval (1-3 business days). You won't see credentials until approved.
