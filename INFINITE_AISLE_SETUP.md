# Infinite Aisle Agent - Setup Guide

## 🎯 Overview

DesireFinder has been transformed into an **"Infinite Aisle" Agent** - a Universal Personal Shopper that adapts to any niche on the fly. Instead of a pre-curated boutique, this system dynamically sources products from global suppliers (AliExpress, CJ Dropshipping) while strictly filtering for quality.

## 🏗️ Architecture: The "Vetting Funnel"

### 4-Step Workflow

1. **Translation (The "Desire" Layer)**
   - User says: "I want a techwear vibe"
   - LLM translates to: "waterproof matte black cargo pants", "fidlock belt", "techwear vest"

2. **Broad Search (The Dragnet)**
   - Agent hits global supplier API (AliExpress, CJ Dropshipping)
   - Pulls 50+ raw results for those terms

3. **The Filter (The "Quality" Layer)**
   - Hard metrics filter (code-based, not LLM):
     - ✅ Must have: > 4.5 Stars
     - ✅ Must have: > 100 Orders (Social Proof)
     - ✅ Must have: ePacket/Standard Shipping (≤ 15 days, no 60-day shipping)

4. **Presentation**
   - Agent presents top 3-5 "Survivors" with:
     - Markup pricing (2.5x multiplier)
     - Tailored sales pitch
     - Import/checkout flow

## 🔧 Technical Implementation

### Quality Filter Thresholds

Located in `src/lib/dropshipping/api.ts`:

```typescript
const QUALITY_THRESHOLDS = {
  MIN_RATING: 4.5,
  MIN_ORDERS: 100,
  MAX_SHIPPING_DAYS: 15,
};

const MARKUP_MULTIPLIER = 2.5;
```

### Diagnostic Phase

The agent now includes a "Diagnostic Phase" before searching:

- **System Prompt**: Updated in `src/lib/prompts/search/writer.ts` and `src/lib/agents/search/researcher/actions/shoppingSearch.ts`
- **Behavior**: Agent asks 2-3 clarifying questions before searching:
  - Aesthetic/vibe preferences
  - Budget range
  - Use case or recipient
  - Specific features

Example:
```
User: "I want a new bag."
Agent: "Are we going for 'Professional Minimalist' (leather, structured) or 'Urban Explorer' (techwear, waterproof, modular)?"
User: "Urban explorer, black only."
Agent: [Executes search for "black techwear sling bag" + Filters > 4.5 Stars]
```

## 💰 Profitability: On-Demand Arbitrage

### The "Ghost" Cart Strategy

1. **Price Markup**: Supplier price $10 → Display price $24.99 (2.5x)
2. **Import Link**: "Buy" button goes to `/api/products/import` (not AliExpress)
3. **Just-In-Time Creation**:
   - User clicks "Buy"
   - Backend checks: "Do I have this item in my DB?"
   - If No: Creates product record, adds markup, generates Stripe checkout
   - If Yes: Proceeds to checkout
4. **Fulfillment**: Once user pays $25, use automation (DSers) to buy from supplier for $10

### Database Schema

Added to `prisma/schema.prisma`:

- **Product**: On-demand product creation
  - `supplierProductId`: Original product ID from supplier
  - `supplierPrice`: Original price
  - `markedUpPrice`: Price with markup (2.5x)
  - Quality metrics: rating, orders, shippingDays, etc.

- **Order**: On-demand fulfillment
  - Links to Product and User
  - Tracks payment intent (Stripe)
  - Tracks fulfillment ID (DSers)

## 🔌 API Integration

### Supported Providers

1. **AliExpress API** (Recommended)
   - Via RapidAPI: `https://aliexpress-data.p.rapidapi.com`
   - Environment variables:
     ```bash
     DROPSHIPPING_API_PROVIDER=aliexpress
     RAPIDAPI_KEY=your_rapidapi_key
     ```

2. **CJ Dropshipping API**
   - Environment variables:
     ```bash
     DROPSHIPPING_API_PROVIDER=cj
     DROPSHIPPING_API_KEY=your_cj_api_key
     ```

3. **SerpApi** (For trend discovery)
   - Environment variables:
     ```bash
     DROPSHIPPING_API_PROVIDER=serpapi
     SERPAPI_KEY=your_serpapi_key
     ```

### Setup Instructions

1. **Get API Key**:
   - Sign up for RapidAPI: https://rapidapi.com/
   - Subscribe to "AliExpress Data API" or similar
   - Copy your API key

2. **Configure Environment**:
   ```bash
   DROPSHIPPING_API_PROVIDER=aliexpress
   RAPIDAPI_KEY=your_rapidapi_key_here
   ALIEXPRESS_API_URL=https://aliexpress-data.p.rapidapi.com
   ```

3. **Stripe Setup** (For checkout):
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   NEXT_PUBLIC_APP_URL=https://desirefinder.com
   ```

## 📦 Product Flow

### 1. Search Flow

```
User Query → Diagnostic Phase → Product Search → Quality Filter → Markup Pricing → Display
```

### 2. Purchase Flow

```
User Clicks "Buy" → /api/products/import → Create Product (if not exists) → Create Order → Stripe Checkout → Fulfillment
```

### 3. Import API

**Endpoint**: `POST /api/products/import`

**Request Body**:
```json
{
  "supplierProductId": "AE123456",
  "productData": {
    "name": "Product Name",
    "supplierPrice": 10.00,
    "price": 25.00,
    "currency": "USD",
    "imageUrl": "...",
    "vendor": "AliExpress",
    ...
  }
}
```

**Response**:
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/...",
  "orderId": "uuid",
  "productId": "uuid"
}
```

## 🎨 UI Updates

### ProductCard Component

- **Markup Display**: Shows marked-up price with original supplier price (strikethrough)
- **Quality Indicators**: 
  - Rating badge (must be > 4.5)
  - Orders count (must be > 100)
  - Shipping days (must be ≤ 15)
- **Import Link**: "Buy" button calls `/api/products/import` instead of direct supplier URL

### Product Results

- Automatically filtered by quality thresholds
- Sorted by quality score (rating × orders)
- Top 3-5 products displayed

## 🚀 Next Steps

1. **Get API Keys**:
   - Sign up for RapidAPI and subscribe to AliExpress Data API
   - Get Stripe API keys for checkout

2. **Run Database Migration**:
   ```bash
   npx prisma migrate dev --name add_products_and_orders
   npx prisma generate
   ```

3. **Test the Flow**:
   - Search for a product
   - Verify quality filtering works
   - Click "Buy" and test checkout

4. **Set Up Fulfillment**:
   - Integrate DSers or similar automation
   - Set up webhook to process orders after payment

## 📊 Quality Metrics

All products must pass these filters:

- ✅ **Rating**: > 4.5 stars
- ✅ **Orders**: > 100 orders (social proof)
- ✅ **Shipping**: ≤ 15 days (no 60-day shipping)
- ✅ **In Stock**: Must be available

Products that fail any filter are automatically rejected before presentation to the user.

## 🔒 Security

- All checkout sessions use Stripe (PCI compliant)
- Product data is validated before creation
- Orders are tracked with payment intent IDs
- Fulfillment automation can be added via webhooks

## 📝 Notes

- The system uses a 2.5x markup multiplier (configurable in `src/lib/dropshipping/api.ts`)
- Quality filtering happens server-side (code-based, not LLM-based)
- Products are created on-demand (no pre-loading required)
- The diagnostic phase helps narrow down user desires before searching
