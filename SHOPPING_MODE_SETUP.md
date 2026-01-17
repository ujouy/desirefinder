# Shopping/Dropshipping Mode Setup Guide

## 🎯 Overview

DesireFinder now includes an AI-powered shopping mode that acts as a "Desire Engine" - helping users discover products based on their needs, style preferences, and use cases. Instead of browsing static product catalogs, users describe what they want (or who they're buying for), and the AI recommends curated products.

## ✨ Features

- **Natural Language Product Search**: Users describe their needs in plain English
- **AI Product Recommendations**: LLM analyzes user intent and recommends matching products
- **Product Cards**: Beautiful product displays with images, prices, ratings, and buy buttons
- **Multiple Search Iterations**: AI refines searches based on user preferences (speed/balanced/quality modes)

## 🏗️ Architecture

### Components Created

1. **`src/lib/dropshipping/api.ts`**
   - Dropshipping API integration service
   - Currently uses mock data for development
   - Ready to connect to real APIs (Spocket, Syncee, AliExpress, or custom Supabase DB)

2. **`src/lib/agents/search/researcher/actions/shoppingSearch.ts`**
   - Shopping search action that queries product databases
   - Extracts product keywords, categories, and preferences from user queries
   - Returns products in the standard `Chunk` format

3. **`src/components/ProductCard.tsx`**
   - Product card component for displaying products
   - Shows image, title, price, rating, vendor, and buy button
   - Responsive grid layout

4. **UI Integration**
   - Added "Shopping" option to source selector
   - `MessageSources` component automatically detects and displays products
   - Seamless integration with existing Perplexica architecture

## 🔧 Setup Instructions

### Step 1: Connect to a Dropshipping API

You have several options:

#### Option A: Spocket API (Recommended for Premium Products)
1. Sign up at https://spocket.co/
2. Get API credentials from Spocket dashboard
3. Set environment variables:
   ```bash
   DROPSHIPPING_API_URL=https://api.spocket.co
   DROPSHIPPING_API_KEY=your_spocket_api_key
   ```

#### Option B: Syncee API (Multi-Supplier Aggregator)
1. Sign up at https://syncee.io/
2. Get API credentials
3. Set environment variables:
   ```bash
   DROPSHIPPING_API_URL=https://api.syncee.io
   DROPSHIPPING_API_KEY=your_syncee_api_key
   ```

#### Option C: Custom Supabase Product Database
1. Create a Supabase project
2. Create a `products` table:
   ```sql
   CREATE TABLE products (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     description TEXT,
     price DECIMAL(10,2) NOT NULL,
     currency TEXT DEFAULT 'USD',
     image_url TEXT,
     buy_url TEXT NOT NULL,
     vendor TEXT,
     category TEXT,
     rating DECIMAL(3,2),
     reviews INTEGER DEFAULT 0,
     in_stock BOOLEAN DEFAULT true,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Add vector search for semantic product matching
   CREATE EXTENSION IF NOT EXISTS vector;
   ALTER TABLE products ADD COLUMN embedding vector(1536);
   ```

3. Create a Supabase Edge Function or API endpoint that:
   - Accepts search queries
   - Performs semantic search using embeddings
   - Returns products in the expected format

4. Update `src/lib/dropshipping/api.ts` to call your Supabase API

#### Option D: AliExpress Dropshipping API
- Use AliExpress Dropshipping Center API
- Requires AliExpress seller account
- Lower margins but large catalog

### Step 2: Update the API Integration

Edit `src/lib/dropshipping/api.ts` and update the `searchProducts` function to call your chosen API:

```typescript
export async function searchProducts(
  options: DropshippingSearchOptions
): Promise<Product[]> {
  const { query, limit = 10 } = options;
  const apiUrl = process.env.DROPSHIPPING_API_URL;
  const apiKey = process.env.DROPSHIPPING_API_KEY;

  // Call your actual API
  const response = await fetch(`${apiUrl}/api/products/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      limit,
      ...options,
    }),
  });

  const data = await response.json();
  
  // Transform API response to Product format
  return data.products.map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: parseFloat(p.price),
    currency: p.currency || 'USD',
    imageUrl: p.image_url || p.imageUrl,
    buyUrl: p.buy_url || p.buyUrl || p.affiliate_url,
    vendor: p.vendor || p.supplier,
    category: p.category,
    rating: p.rating ? parseFloat(p.rating) : undefined,
    reviews: p.reviews || p.review_count,
    inStock: p.in_stock !== false,
  }));
}
```

### Step 3: Configure Environment Variables

Add to your `.env` file:

```env
# Dropshipping API Configuration
DROPSHIPPING_API_URL=https://your-api-url.com
DROPSHIPPING_API_KEY=your_api_key_here

# Optional: Default to shopping mode
DEFAULT_SOURCES=shopping
```

### Step 4: Test the Integration

1. Start your development server:
   ```bash
   yarn dev
   ```

2. Navigate to the app and select "Shopping" from the source selector

3. Try queries like:
   - "I need a minimalist desk setup for a software engineer"
   - "What are good gifts for a plant lover?"
   - "Show me ergonomic office accessories"

4. The AI should:
   - Extract product keywords and preferences
   - Search your product database
   - Display product cards with buy buttons

## 🎨 Customization

### Modify Product Display

Edit `src/components/ProductCard.tsx` to customize:
- Product card layout
- Price formatting
- Rating display
- Buy button styling

### Adjust AI Prompts

Edit `src/lib/agents/search/researcher/actions/shoppingSearch.ts` to:
- Change how the AI extracts product preferences
- Modify search strategies for different modes
- Add custom product filtering logic

### Add Product Categories

Update the classifier in `src/lib/prompts/search/classifier.ts` to detect shopping queries automatically.

## 📊 Expected API Response Format

Your dropshipping API should return products in this format:

```json
{
  "products": [
    {
      "id": "product-123",
      "name": "Product Name",
      "description": "Product description",
      "price": 49.99,
      "currency": "USD",
      "image_url": "https://example.com/image.jpg",
      "buy_url": "https://example.com/product/123",
      "vendor": "Vendor Name",
      "category": "Electronics",
      "rating": 4.5,
      "reviews": 128,
      "in_stock": true
    }
  ]
}
```

## 🚀 Next Steps

1. **Connect Real API**: Replace mock data with actual dropshipping API
2. **Add Affiliate Tracking**: Implement click tracking for commission tracking
3. **Product Filtering**: Add filters for price range, category, rating
4. **Wishlist Feature**: Allow users to save products
5. **Price Alerts**: Notify users when products go on sale
6. **Product Reviews**: Integrate review data from suppliers
7. **Multi-Currency**: Support different currencies based on user location

## 💡 Business Model Ideas

1. **Affiliate Commissions**: Earn commission on each sale
2. **Premium Curation**: Charge for access to premium product recommendations
3. **White-Label**: License the shopping engine to other businesses
4. **API Access**: Charge developers for API access to your product database

## 🐛 Troubleshooting

### Products Not Showing
- Check that `DROPSHIPPING_API_URL` is set correctly
- Verify API key is valid
- Check browser console for API errors
- Ensure products are returned in the correct format

### AI Not Finding Products
- Adjust prompts in `shoppingSearch.ts`
- Check that product database has good descriptions
- Consider adding semantic search (vector embeddings)

### Product Cards Not Rendering
- Verify `MessageSources.tsx` detects products correctly
- Check that product metadata includes `type: 'product'` or `productId`
- Ensure `ProductCard.tsx` is imported correctly

## 📝 Notes

- The current implementation uses mock data for development
- Replace `getMockProducts()` in `api.ts` with real API calls
- Consider caching product searches for better performance
- Add rate limiting to prevent API abuse
- Implement product image optimization/CDN for faster loading
