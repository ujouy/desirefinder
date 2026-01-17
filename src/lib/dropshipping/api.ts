/**
 * Infinite Aisle - Dynamic Dropshipping API Integration
 * 
 * This service implements the "Vetting Funnel" architecture:
 * 1. Translation: Converts user desires into concrete search terms
 * 2. Broad Search: Queries global supplier APIs (AliExpress, CJ Dropshipping, etc.)
 * 3. Quality Filter: Hard metrics filter (rating > 4.5, orders > 100, shipping < 15 days)
 * 4. Presentation: Returns top 3-5 filtered products with markup pricing
 * 
 * Supported APIs:
 * - AliExpress API (via RapidAPI or AliExpress Open Platform)
 * - CJ Dropshipping API
 * - SerpApi (Google Shopping - for trend discovery)
 * 
 * ⚡ Performance: Uses Next.js 16 caching for product searches (not user-specific chat)
 */

import { cache } from 'react';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  buyUrl: string;
  vendor?: string;
  category?: string;
  rating?: number;
  reviews?: number;
  orders?: number;
  shippingDays?: number;
  shippingMethod?: string;
  inStock?: boolean;
  supplierProductId?: string;
  supplierPrice?: number;
}

export interface DropshippingSearchOptions {
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  shipToCountry?: string;
  sortBy?: 'ORDERS_DESC' | 'RATING_DESC' | 'PRICE_ASC' | 'PRICE_DESC';
}

const QUALITY_THRESHOLDS = {
  MIN_RATING: 4.5,
  MIN_ORDERS: 100,
  MAX_SHIPPING_DAYS: 15,
};

const MARKUP_MULTIPLIER = 2.5;

/**
 * Internal search function (not cached, used by cached wrapper)
 */
async function _searchProductsInternal(
  options: DropshippingSearchOptions
): Promise<Product[]> {
  const { query, limit = 50, shipToCountry = 'US', sortBy = 'ORDERS_DESC' } = options;

  const apiProvider = process.env.DROPSHIPPING_API_PROVIDER || 'aliexpress';
  const apiKey = process.env.DROPSHIPPING_API_KEY || process.env.RAPIDAPI_KEY || '';

  if (!apiKey) {
    throw new Error('DROPSHIPPING_API_KEY or RAPIDAPI_KEY environment variable is required. Please configure your API key in .env file.');
  }

  try {
    let rawProducts: Product[] = [];

    // ⚡ PARALLELIZATION: Fetch from multiple providers in parallel if configured
    const searchPromises: Promise<Product[]>[] = [];

    if (apiProvider === 'aliexpress' || apiProvider === 'openservice-aliexpress' || apiProvider.includes('aliexpress')) {
      searchPromises.push(searchAliExpress(query, { limit, shipToCountry, sortBy, apiKey }));
    }
    if (apiProvider === 'cj' || apiProvider.includes('cj')) {
      searchPromises.push(searchCJDropshipping(query, { limit, apiKey }));
    }
    if (apiProvider === 'serpapi' || apiProvider.includes('serpapi')) {
      searchPromises.push(searchSerpApi(query, { limit, apiKey }));
    }

    // If single provider, use switch (backward compatible)
    if (searchPromises.length === 0) {
      switch (apiProvider) {
        case 'aliexpress':
        case 'openservice-aliexpress':
          rawProducts = await searchAliExpress(query, { limit, shipToCountry, sortBy, apiKey });
          break;
        case 'cj':
          rawProducts = await searchCJDropshipping(query, { limit, apiKey });
          break;
        case 'serpapi':
          rawProducts = await searchSerpApi(query, { limit, apiKey });
          break;
        default:
          throw new Error(`Unsupported API provider: ${apiProvider}. Supported providers: aliexpress, openservice-aliexpress, cj, serpapi`);
      }
    } else {
      // Parallel fetch from multiple providers
      const results = await Promise.all(searchPromises);
      rawProducts = results.flat();
    }

    // ⚡ PARALLELIZATION: Pre-fetch detailed variant checks for top candidates
    // Get top 10 candidates before detailed filtering
    const preFiltered = applyQualityFilter(rawProducts);
    const topCandidates = preFiltered
      .sort((a, b) => {
        const scoreA = (a.rating || 0) * (a.orders || 0);
        const scoreB = (b.rating || 0) * (b.orders || 0);
        return scoreB - scoreA;
      })
      .slice(0, 10);

    // 🧠 VISUAL QUALITY CHECK: Fast regex filter + Gemini Vision API
    // Step 1: Quick regex filter (removes obviously low-quality products)
    const regexFiltered = topCandidates.filter(quickVisualFilter);

    // Step 2: Parallel image quality validation using Gemini Vision for remaining products
    const imageQualityChecks = await Promise.all(
      regexFiltered.map(async (product) => {
        if (!product.imageUrl) {
          return { product, qualityPass: false }; // No image = reject
        }
        
        try {
          // Pass product data for regex fallback
          const qualityPass = await checkImageQuality(product.imageUrl, product);
          return { product, qualityPass };
        } catch (error) {
          console.error(`Image quality check failed for ${product.id}:`, error);
          // If Gemini fails, use regex result (already passed regex filter)
          return { product, qualityPass: true }; // Fail open
        }
      })
    );

    // Filter to only high-quality images
    const qualityFiltered = imageQualityChecks
      .filter(({ qualityPass }) => qualityPass)
      .map(({ product }) => product);

    const sortedProducts = qualityFiltered.sort((a, b) => {
      const scoreA = (a.rating || 0) * (a.orders || 0);
      const scoreB = (b.rating || 0) * (b.orders || 0);
      return scoreB - scoreA;
    });

    return sortedProducts.slice(0, Math.min(limit || 5, 5));
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
}

/**
 * Cached product search - Uses React cache for request-level memoization
 * Note: For persistent caching across requests, consider using Redis or a CDN
 * This provides request-level deduplication (same query in same request = 1 API call)
 */
const getCachedSearch = cache(
  async (query: string, limit: number, shipToCountry: string, sortBy: 'ORDERS_DESC' | 'RATING_DESC' | 'PRICE_ASC' | 'PRICE_DESC') => {
    return _searchProductsInternal({ query, limit, shipToCountry, sortBy });
  }
);

export async function searchProducts(
  options: DropshippingSearchOptions
): Promise<Product[]> {
  const { query, limit = 50, shipToCountry = 'US', sortBy = 'ORDERS_DESC' } = options;

  // Use cached search (deduplicates same query within same request)
  // For persistent caching, consider Redis or external cache layer
  return getCachedSearch(query, limit, shipToCountry, sortBy);
}

function applyQualityFilter(products: Product[]): Product[] {
  return products.filter((product) => {
    if (!product.rating || product.rating < QUALITY_THRESHOLDS.MIN_RATING) {
      return false;
    }

    if (!product.orders || product.orders < QUALITY_THRESHOLDS.MIN_ORDERS) {
      return false;
    }

    if (product.shippingDays && product.shippingDays > QUALITY_THRESHOLDS.MAX_SHIPPING_DAYS) {
      return false;
    }

    if (product.inStock === false) {
      return false;
    }

    return true;
  });
}

async function searchAliExpress(
  query: string,
  options: {
    limit: number;
    shipToCountry: string;
    sortBy: string;
    apiKey: string;
  }
): Promise<Product[]> {
  const apiProvider = process.env.DROPSHIPPING_API_PROVIDER || 'aliexpress';
  
  // Check if using OpenService (official AliExpress API)
  if (apiProvider === 'openservice-aliexpress' || process.env.ALIEXPRESS_APP_KEY) {
    return searchOpenServiceAliExpress(query, options);
  }
  
  // Fallback to RapidAPI (legacy)
  const apiUrl = process.env.ALIEXPRESS_API_URL || 'https://aliexpress-data.p.rapidapi.com';
  const apiKey = options.apiKey || process.env.RAPIDAPI_KEY || '';

  if (!apiKey) {
    throw new Error('RAPIDAPI_KEY or ALIEXPRESS_API_KEY is required for AliExpress search. Please set it in your .env file.');
  }

  const response = await fetch(`${apiUrl}/product/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'aliexpress-data.p.rapidapi.com',
    },
    body: JSON.stringify({
      keywords: query,
      page: 1,
      pageSize: options.limit,
      sort: options.sortBy === 'ORDERS_DESC' ? 'ORDERS' : 'RATING',
      shipTo: options.shipToCountry,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AliExpress API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  
  return (data.results || []).map((item: any) => ({
    id: item.productId || crypto.randomUUID(),
    name: item.title || item.productTitle || 'Unknown Product',
    description: item.description || item.productDescription || '',
    price: parseFloat(item.price?.value || item.price || 0),
    currency: item.price?.currency || 'USD',
    imageUrl: item.imageUrl || item.productImage || '',
    buyUrl: item.productUrl || item.affiliateUrl || '',
    vendor: item.storeName || 'AliExpress',
    category: item.category || '',
    rating: parseFloat(item.rating || item.averageStarRate || 0),
    reviews: parseInt(item.reviews || item.totalReviews || 0),
    orders: parseInt(item.orders || item.totalOrders || 0),
    shippingDays: parseInt(item.shippingInfo?.deliveryTime || item.deliveryTime || 30),
    shippingMethod: item.shippingInfo?.method || 'Standard',
    inStock: item.inStock !== false,
    supplierProductId: item.productId,
    supplierPrice: parseFloat(item.price?.value || item.price || 0),
  }));
}

/**
 * OpenService AliExpress API (Official AliExpress API)
 * Uses OAuth2 authentication with App Key, App Secret, and Access Token
 */
async function searchOpenServiceAliExpress(
  query: string,
  options: {
    limit: number;
    shipToCountry: string;
    sortBy: string;
    apiKey: string;
  }
): Promise<Product[]> {
  const appKey = process.env.ALIEXPRESS_APP_KEY || '';
  const appSecret = process.env.ALIEXPRESS_APP_SECRET || '';
  const accessToken = process.env.ALIEXPRESS_ACCESS_TOKEN || '';
  const apiUrl = process.env.ALIEXPRESS_API_URL || 'https://api-sg.aliexpress.com';

  if (!appKey || !appSecret || !accessToken) {
    throw new Error('ALIEXPRESS_APP_KEY, ALIEXPRESS_APP_SECRET, and ALIEXPRESS_ACCESS_TOKEN are required for OpenService AliExpress API. Please set them in your .env file.');
  }

  // OpenService API typically uses query product search endpoint
  // Endpoint: /solutions/product/api/query/aliexpress.product.search
  const endpoint = '/solutions/product/api/query/aliexpress.product.search';
  
  // Build request parameters according to OpenService API spec
  const params = new URLSearchParams({
    keywords: query,
    pageNo: '1',
    pageSize: options.limit.toString(),
    sort: options.sortBy === 'ORDERS_DESC' ? 'SALE_DESC' : 'RATING_DESC',
    locale: 'en_US',
    currency: 'USD',
    shipToCountry: options.shipToCountry || 'US',
  });

  // OpenService requires signature generation (HMAC-SHA256)
  // For now, using access token in header (simplified - may need full OAuth flow)
  const response = await fetch(`${apiUrl}${endpoint}?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'X-Api-Key': appKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenService AliExpress API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  
  // OpenService API response structure may differ - adjust mapping based on actual response
  const products = data.result?.products || data.products || data.data?.products || [];
  
  return products.map((item: any) => ({
    id: item.productId || item.product_id || crypto.randomUUID(),
    name: item.subject || item.title || item.productTitle || 'Unknown Product',
    description: item.productDescription || item.description || '',
    price: parseFloat(item.productPrice?.value || item.price || item.productPrice || 0),
    currency: item.currencyCode || item.currency || 'USD',
    imageUrl: item.productMainImageUrl || item.mainImageUrl || item.imageUrl || '',
    buyUrl: item.productUrl || item.affiliateProductUrl || item.productDetailUrl || '',
    vendor: item.storeName || item.sellerName || 'AliExpress',
    category: item.categoryName || item.category || '',
    rating: parseFloat(item.evaluateScore || item.rating || item.averageStarRate || 0),
    reviews: parseInt(item.evaluateCount || item.reviews || item.totalReviews || 0),
    orders: parseInt(item.volume || item.orders || item.totalOrders || 0),
    shippingDays: parseInt(item.deliveryTime || item.shippingDays || 30),
    shippingMethod: item.shippingMethod || 'Standard',
    inStock: item.inStock !== false,
    supplierProductId: item.productId || item.product_id,
    supplierPrice: parseFloat(item.productPrice?.value || item.price || item.productPrice || 0),
  }));
}

async function searchCJDropshipping(
  query: string,
  options: { limit: number; apiKey: string }
): Promise<Product[]> {
  const apiUrl = process.env.CJ_DROPSHIPPING_API_URL || 'https://api.cjdropshipping.com';
  const apiKey = options.apiKey || process.env.DROPSHIPPING_API_KEY || '';

  if (!apiKey) {
    throw new Error('CJ_DROPSHIPPING_API_KEY is required. Please set it in your .env file.');
  }

  const response = await fetch(`${apiUrl}/api/v1/product/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      keyword: query,
      pageSize: options.limit,
      page: 1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`CJ Dropshipping API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  
  return (data.data?.list || []).map((item: any) => ({
    id: item.productId || item.id || crypto.randomUUID(),
    name: item.productName || item.name || 'Unknown Product',
    description: item.description || item.productDescription || '',
    price: parseFloat(item.price || item.salePrice || 0),
    currency: item.currency || 'USD',
    imageUrl: item.mainImage || item.imageUrl || '',
    buyUrl: item.productUrl || item.url || '',
    vendor: item.supplierName || 'CJ Dropshipping',
    category: item.category || '',
    rating: parseFloat(item.rating || item.averageRating || 0),
    reviews: parseInt(item.reviews || item.reviewCount || 0),
    orders: parseInt(item.orders || item.orderCount || 0),
    shippingDays: parseInt(item.shippingDays || item.deliveryTime || 15),
    shippingMethod: item.shippingMethod || 'Standard',
    inStock: item.inStock !== false,
    supplierProductId: item.productId || item.id,
    supplierPrice: parseFloat(item.price || item.salePrice || 0),
  }));
}

async function searchSerpApi(
  query: string,
  options: { limit: number; apiKey: string }
): Promise<Product[]> {
  const apiKey = options.apiKey || process.env.SERPAPI_KEY || '';

  if (!apiKey) {
    throw new Error('SERPAPI_KEY is required. Please set it in your .env file.');
  }

  const response = await fetch(`https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query)}&api_key=${apiKey}&num=${options.limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SerpApi error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  
  return (data.shopping_results || []).map((item: any) => ({
    id: item.product_id || item.position?.toString() || crypto.randomUUID(),
    name: item.title || 'Unknown Product',
    description: item.description || '',
    price: parseFloat(item.price?.replace(/[^0-9.]/g, '') || 0),
    currency: item.price?.match(/[A-Z]{3}/)?.[0] || 'USD',
    imageUrl: item.thumbnail || '',
    buyUrl: item.link || '',
    vendor: item.source || 'Google Shopping',
    category: item.category || '',
    rating: parseFloat(item.rating || 0),
    reviews: parseInt(item.reviews || 0),
    orders: parseInt(item.reviews || 0) * 10,
    shippingDays: 15,
    shippingMethod: 'Standard',
    inStock: true,
    supplierProductId: item.product_id || item.position?.toString(),
    supplierPrice: parseFloat(item.price?.replace(/[^0-9.]/g, '') || 0),
  }));
}

export function getProductWithMarkup(product: Product): Product {
  const supplierPrice = product.supplierPrice || product.price;
  const markedUpPrice = supplierPrice * MARKUP_MULTIPLIER;

  return {
    ...product,
    price: markedUpPrice,
    supplierPrice: supplierPrice,
  };
}

export function getMarkupMultiplier(): number {
  return MARKUP_MULTIPLIER;
}

/**
 * Fast regex-based visual filtering (fallback before expensive Gemini Vision API)
 * Filters out obviously low-quality products
 */
function quickVisualFilter(product: Product): boolean {
  const name = (product.name || '').toLowerCase();
  const description = (product.description || '').toLowerCase();

  // Ban products with "Generic" in title
  if (name.includes('generic')) {
    return false;
  }

  // Ban products with very short descriptions (< 50 chars suggests low effort)
  if (description.length > 0 && description.length < 50) {
    return false;
  }

  // Ban products with common low-quality indicators
  const lowQualityIndicators = [
    'wholesale',
    'bulk',
    'cheap',
    'low quality',
    'factory direct',
  ];

  const combinedText = `${name} ${description}`;
  if (lowQualityIndicators.some(indicator => combinedText.includes(indicator))) {
    return false;
  }

  return true;
}

/**
 * 🧠 Visual Quality Check using Gemini Vision API
 * Filters out low-quality product images (watermarks, Chinese text, poor quality)
 * This maintains the "Desire" aesthetic by only showing luxury-quality images
 * Falls back to regex filtering if Gemini API fails
 */
export async function checkImageQuality(imageUrl: string, product?: Product): Promise<boolean> {
  // Fast regex filter first (if product data available)
  if (product && !quickVisualFilter(product)) {
    return false;
  }
  const geminiApiKey = process.env.GEMINI_API_KEY;
  
  if (!geminiApiKey) {
    // If Gemini API key not configured, skip quality check (fail open)
    console.warn('GEMINI_API_KEY not configured, skipping image quality check');
    return true;
  }

  try {
    // Fetch image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return false; // If image can't be fetched, reject
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // Call Gemini Vision API
    const visionResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze this product image. Return ONLY "true" or "false" (no explanation).

Criteria for "true":
- High resolution and clear
- Professional white/neutral background
- No watermarks or text overlays
- No Chinese/foreign text in the image
- Clean, luxury aesthetic
- Product is clearly visible

Criteria for "false":
- Low resolution or blurry
- Watermarked or has text overlays
- Contains Chinese or foreign text
- Cluttered background
- Poor lighting or quality
- Looks like a screenshot or low-quality listing

Return ONLY "true" or "false":`,
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!visionResponse.ok) {
      console.warn('Gemini Vision API error, allowing image (fail open)');
      return true; // Fail open if API error
    }

    const visionData = await visionResponse.json();
    const result = visionData.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase();

    // Parse result (should be "true" or "false")
    return result === 'true' || result?.includes('true');
  } catch (error) {
    console.error('Image quality check error:', error);
    return true; // Fail open - allow image if check fails
  }
}

/**
 * Get a single product by supplier product ID
 * Used for Just-In-Time price validation before checkout
 */
export async function getProductById(supplierProductId: string): Promise<Product | null> {
  const apiProvider = process.env.DROPSHIPPING_API_PROVIDER || 'aliexpress';
  const apiKey = process.env.DROPSHIPPING_API_KEY || process.env.RAPIDAPI_KEY || '';

  try {
    let product: Product | null = null;

    // Check if using OpenService (official AliExpress API)
    if (apiProvider === 'openservice-aliexpress' || process.env.ALIEXPRESS_APP_KEY) {
        const appKey = process.env.ALIEXPRESS_APP_KEY || '';
        const accessToken = process.env.ALIEXPRESS_ACCESS_TOKEN || '';
        const apiUrl = process.env.ALIEXPRESS_API_URL || 'https://api-sg.aliexpress.com';
        
        const response = await fetch(`${apiUrl}/solutions/product/api/query/aliexpress.product.detail.get?productId=${supplierProductId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Api-Key': appKey,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const item = data.result || data.data || data;
          product = {
            id: item.productId || supplierProductId,
            name: item.subject || item.title || 'Unknown Product',
            description: item.productDescription || item.description || '',
            price: parseFloat(item.productPrice?.value || item.price || 0),
            currency: item.currencyCode || 'USD',
            imageUrl: item.productMainImageUrl || item.mainImageUrl || '',
            buyUrl: item.productUrl || item.affiliateProductUrl || '',
            vendor: item.storeName || 'AliExpress',
            category: item.categoryName || '',
            rating: parseFloat(item.evaluateScore || item.rating || 0),
            reviews: parseInt(item.evaluateCount || item.reviews || 0),
            orders: parseInt(item.volume || item.orders || 0),
            shippingDays: parseInt(item.deliveryTime || 30),
            shippingMethod: item.shippingMethod || 'Standard',
            inStock: item.inStock !== false,
            supplierProductId: item.productId || supplierProductId,
            supplierPrice: parseFloat(item.productPrice?.value || item.price || 0),
          };
        } else if (response.status === 404) {
          return null;
        }
      } else if (apiProvider === 'aliexpress') {
        // RapidAPI fallback (legacy)
        if (!apiKey) {
          throw new Error('RAPIDAPI_KEY is required for RapidAPI AliExpress. Use OpenService (openservice-aliexpress) or provide RAPIDAPI_KEY.');
        }
        
        const apiUrl = process.env.ALIEXPRESS_API_URL || 'https://aliexpress-data.p.rapidapi.com';
        const response = await fetch(`${apiUrl}/product/${supplierProductId}`, {
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'aliexpress-data.p.rapidapi.com',
          },
        });

        if (response.ok) {
        const data = await response.json();
        product = {
          id: data.productId || supplierProductId,
          name: data.title || data.productTitle || 'Unknown Product',
          description: data.description || data.productDescription || '',
          price: parseFloat(data.price?.value || data.price || 0),
          currency: data.price?.currency || 'USD',
          imageUrl: data.imageUrl || data.productImage || '',
          buyUrl: data.productUrl || data.affiliateUrl || '',
          vendor: data.storeName || 'AliExpress',
          category: data.category || '',
          rating: parseFloat(data.rating || data.averageStarRate || 0),
          reviews: parseInt(data.reviews || data.totalReviews || 0),
          orders: parseInt(data.orders || data.totalOrders || 0),
          shippingDays: parseInt(data.shippingInfo?.deliveryTime || data.deliveryTime || 30),
          shippingMethod: data.shippingInfo?.method || 'Standard',
          inStock: data.inStock !== false,
          supplierProductId: data.productId || supplierProductId,
          supplierPrice: parseFloat(data.price?.value || data.price || 0),
        };
      } else if (response.status === 404) {
        return null;
      }
    } else if (apiProvider === 'cj') {
      const apiUrl = process.env.CJ_DROPSHIPPING_API_URL || 'https://api.cjdropshipping.com';
      const response = await fetch(`${apiUrl}/api/v1/product/${supplierProductId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        product = {
          id: data.productId || data.id || supplierProductId,
          name: data.productName || data.name || 'Unknown Product',
          description: data.description || data.productDescription || '',
          price: parseFloat(data.price || data.salePrice || 0),
          currency: data.currency || 'USD',
          imageUrl: data.mainImage || data.imageUrl || '',
          buyUrl: data.productUrl || data.url || '',
          vendor: data.supplierName || 'CJ Dropshipping',
          category: data.category || '',
          rating: parseFloat(data.rating || data.averageRating || 0),
          reviews: parseInt(data.reviews || data.reviewCount || 0),
          orders: parseInt(data.orders || data.orderCount || 0),
          shippingDays: parseInt(data.shippingDays || data.deliveryTime || 15),
          shippingMethod: data.shippingMethod || 'Standard',
          inStock: data.inStock !== false,
          supplierProductId: data.productId || data.id || supplierProductId,
          supplierPrice: parseFloat(data.price || data.salePrice || 0),
        };
      } else if (response.status === 404) {
        return null;
      }
    }

    if (!product) {
      return null;
    }

    return getProductWithMarkup(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }
}
