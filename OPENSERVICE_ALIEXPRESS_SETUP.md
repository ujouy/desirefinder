# OpenService AliExpress API Setup Guide

## 📋 Step 1: Fill Out OpenService Application Form

When creating your OpenService app at https://open.aliexpress.com, fill in:

### App Name
```
DesireFinder
```
(Or any name you prefer, max 128 characters)

### Callback URL
```
https://your-domain.com/api/dropshipping/aliexpress/callback
```
**Important**: Replace `your-domain.com` with your actual domain. For initial testing, you can use:
```
http://localhost:3000/api/dropshipping/aliexpress/callback
```
(You'll need to update this to your production domain later)

### App Description
```
DesireFinder is an AI-powered shopping assistant that helps users discover and purchase products from AliExpress. The application uses the AliExpress OpenService API to search for products, retrieve product details, and generate affiliate links for dropshipping.
```

### App Logo
Upload your app logo (optional but recommended)

---

## 🔑 Step 2: Get Your API Credentials

After submitting the form:

1. **Wait for Approval**: AliExpress will review your application (usually 1-3 business days)

2. **Once Approved, Go to OpenService Dashboard**:
   - Login at https://open.aliexpress.com
   - Navigate to **"My Apps"** or **"Application Management"**
   - Find your "DesireFinder" app
   - Click on it to view details

3. **Get Your Credentials**:
   - **APP_KEY** (Client ID): Found in the app details page
   - **APP_SECRET** (Client Secret): Found in the app details page (may need to click "Show Secret")
   - **ACCESS_TOKEN**: This depends on the API type:
     - **For Product Search APIs**: You may get a direct access token in the dashboard
     - **For OAuth APIs**: You'll need to complete the OAuth flow (see Step 4)

4. **Save These Credentials**: You'll need them for your `.env.production` file

---

## ⚙️ Step 3: Configure Environment Variables

Add these to your `.env.production`:

```env
# OpenService AliExpress API
DROPSHIPPING_API_PROVIDER=openservice-aliexpress
ALIEXPRESS_APP_KEY=your_app_key_here
ALIEXPRESS_APP_SECRET=your_app_secret_here
ALIEXPRESS_ACCESS_TOKEN=your_access_token_here
ALIEXPRESS_API_URL=https://api-sg.aliexpress.com
```

---

## 🔄 Step 4: Getting the Access Token

There are two ways to get an access token, depending on your API type:

### Option A: Direct Access Token (Product Search APIs)

Some OpenService APIs provide a **direct access token** in the dashboard:

1. Go to your app in OpenService dashboard
2. Look for **"Access Token"** or **"API Token"** section
3. Copy the token directly
4. Add to `.env.production`:
   ```env
   ALIEXPRESS_ACCESS_TOKEN=your_token_here
   ```

### Option B: OAuth Flow (If Required)

If your API requires OAuth2 authentication:

1. **Get Authorization Code**:
   - Visit the authorization URL (provided in OpenService docs)
   - User/seller authorizes your app
   - Redirects to your callback URL with `?code=AUTHORIZATION_CODE`

2. **Exchange Code for Token**:
   - Your callback endpoint (`/api/dropshipping/aliexpress/callback`) receives the code
   - Makes a POST request to OpenService token endpoint:
     ```
     POST https://api-sg.aliexpress.com/oauth/token
     {
       "grant_type": "authorization_code",
       "client_id": "YOUR_APP_KEY",
       "client_secret": "YOUR_APP_SECRET",
       "code": "AUTHORIZATION_CODE",
       "redirect_uri": "https://desirefinder.com/api/dropshipping/aliexpress/callback"
     }
     ```
   - Response contains `access_token` and `refresh_token`

3. **Store the Token**: Save the access token to your `.env.production` or database

**Note**: For dropshipping/product search, you typically get a direct access token (Option A) rather than needing OAuth.

---

## 📚 OpenService API Documentation

- **Official Docs**: https://open.aliexpress.com/doc/doc.htm
- **API Reference**: https://open.aliexpress.com/doc/api.htm
- **SDK Downloads**: https://open.aliexpress.com/doc/sdk.htm

---

## ⚠️ Important Notes

1. **API Limits**: OpenService has rate limits (check your plan)
2. **Affiliate Links**: You may need to join AliExpress Affiliate Program separately
3. **Product Data**: OpenService provides official product data (more reliable than RapidAPI)
4. **Approval Time**: Application approval can take 1-3 business days

---

## 🚀 Next Steps

After you get your credentials:
1. Add them to `.env.production`
2. Update the code (I'll help with this)
3. Test the integration
4. Deploy to production
