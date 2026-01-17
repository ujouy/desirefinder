# NowPayments Configuration Guide

## ✅ Your API Key

Your NowPayments API Key: `RS7XRMH-06SM0CP-GNEG7ZC-NBW33G9`

## 🔧 Step 1: Get IPN Secret

1. Login to https://nowpayments.io
2. Go to **Dashboard → Settings → IPN Settings**
3. Copy your **IPN Secret Key**
4. Add to `.env` as `NOWPAYMENTS_IPN_SECRET`

## 🔧 Step 2: Configure IPN Webhook

1. In NowPayments Dashboard → **IPN Settings**
2. Add IPN URL: `https://desirefinder.com/api/webhooks/nowpayments`
3. Enable IPN notifications
4. Save the IPN Secret (use in `.env`)

## 🔧 Step 3: Enable Payment Methods

1. Dashboard → **Payment Methods**
2. Enable:
   - ✅ Bitcoin (BTC)
   - ✅ Ethereum (ETH)
   - ✅ USDT (recommended for stability)
   - ✅ Other cryptos as needed

## 🔧 Step 4: Set Minimum Payment

1. Dashboard → **Settings**
2. Set minimum payment: **$5.00** (matches Explorer package)
3. This prevents micro-transactions

## 🔧 Step 5: Test Payment (Optional)

1. Use NowPayments test mode (if available)
2. Or make a small real payment ($5)
3. Verify webhook receives payment confirmation
4. Check database: Credits should auto-add

## 📊 Payment Flow

1. User clicks "Buy with Crypto" on `/pricing`
2. Frontend calls `/api/payments/create`
3. Backend creates NowPayments invoice
4. User redirected to NowPayments payment page
5. User pays with crypto
6. NowPayments sends webhook to `/api/webhooks/nowpayments`
7. Backend verifies signature and adds credits
8. User can search again

## 🔒 Security

- ✅ Webhook signature verification (HMAC SHA-512)
- ✅ Transaction ID validation
- ✅ Payment status checking
- ✅ Duplicate payment prevention

## 🐛 Common Issues

### "Invalid API Key"
- Check API key is correct: `RS7XRMH-06SM0CP-GNEG7ZC-NBW33G9`
- Verify no extra spaces
- Check account is active

### "Webhook Not Received"
- Verify IPN URL is HTTPS (required)
- Check IPN Secret matches
- Review NowPayments dashboard for webhook logs

### "Payment Status Not Updating"
- Check webhook is enabled
- Verify IPN URL is accessible
- Review application logs for errors

## 📝 API Integration

The payment API is already configured in:
- `src/app/api/payments/create/route.ts` - Creates invoices
- `src/app/api/webhooks/nowpayments/route.ts` - Handles payments

No code changes needed - just configure the webhook URL in NowPayments dashboard.

## ✅ Checklist

- [ ] IPN Secret copied to `.env`
- [ ] IPN Webhook URL configured in NowPayments
- [ ] Payment methods enabled
- [ ] Minimum payment set
- [ ] Test payment completed
- [ ] Credits auto-adding after payment

## 🎉 Ready!

Once configured, payments will work automatically. Users can purchase credits with crypto and they'll be added instantly via webhook.
