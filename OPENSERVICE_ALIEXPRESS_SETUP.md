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
2. **Get App Key & Secret**: Once approved, you'll receive:
   - `APP_KEY` (also called Client ID)
   - `APP_SECRET` (also called Client Secret)
   - `ACCESS_TOKEN` (for API calls)

3. **Save These Credentials**: You'll need them for your `.env.production` file

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

## 🔄 Step 4: OAuth Flow (If Required)

Some OpenService APIs require OAuth2 authentication. If your API requires it:

1. **Authorization URL**: Users/sellers authorize your app
2. **Callback Handler**: We'll create `/api/dropshipping/aliexpress/callback` to handle the OAuth callback
3. **Token Refresh**: Access tokens may expire and need refresh

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
