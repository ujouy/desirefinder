import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { getProductById, getProductWithMarkup } from '@/lib/dropshipping/api';
import { getMarkupMultiplier } from '@/lib/dropshipping/api';

/**
 * Import/Checkout API - On-Demand Product Creation
 * 
 * This implements the "Ghost Cart" strategy:
 * 1. User clicks "Buy" on a product
 * 2. Check if product exists in our DB
 * 3. If not, create it with markup pricing
 * 4. Create checkout session (Stripe)
 * 5. Return checkout URL
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { supplierProductId, productData, expectedCost } = body;

    if (!supplierProductId && !productData) {
      return NextResponse.json(
        { error: 'Missing supplierProductId or productData' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let product;

    // Check if product already exists
    if (supplierProductId) {
      product = await prisma.product.findFirst({
        where: { supplierProductId },
      });
    }

    // If product doesn't exist, create it from productData
    if (!product && productData) {
      const markupMultiplier = getMarkupMultiplier();
      const supplierPrice = productData.supplierPrice || productData.price || 0;
      const markedUpPrice = supplierPrice * markupMultiplier;

      product = await prisma.product.create({
        data: {
          supplierProductId: productData.supplierProductId || productData.id || crypto.randomUUID(),
          name: productData.name || productData.title || 'Product',
          description: productData.description || '',
          supplierPrice: supplierPrice,
          markedUpPrice: markedUpPrice,
          currency: productData.currency || 'USD',
          imageUrl: productData.imageUrl || productData.image || null,
          supplierUrl: productData.buyUrl || productData.url || '',
          vendor: productData.vendor || null,
          category: productData.category || null,
          rating: productData.rating || null,
          reviews: productData.reviews || null,
          orderCount: productData.orders || null, // Map API 'orders' to DB 'orderCount'
          shippingDays: productData.shippingDays || null,
          shippingMethod: productData.shippingMethod || null,
          inStock: productData.inStock !== false,
        },
      });
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found and could not be created' },
        { status: 404 }
      );
    }

    // 🛑 CRITICAL: Just-In-Time Price Validation (Prevents Price Drift)
    // Re-fetch live price from supplier API before creating order
    // DO NOT TRUST frontend price or database "last seen" price
    const { getProductById: fetchLiveProduct } = await import('@/lib/dropshipping/api');
    
    let liveSupplierPrice: number = product.supplierPrice;
    const expectedSupplierPrice = product.supplierPrice;

    try {
      // 1. RE-FETCH LIVE DATA from supplier API
      const liveProduct = await fetchLiveProduct(product.supplierProductId);

      if (!liveProduct) {
        // Product no longer exists - abort
        return NextResponse.json(
          { error: 'Product is no longer available. Please try another product.' },
          { status: 409 }
        );
      }

      // 2. CALCULATE MARGIN SAFETY
      liveSupplierPrice = liveProduct.supplierPrice || liveProduct.price / getMarkupMultiplier();
      
      // Use expectedCost from frontend if provided, otherwise use stored price
      const expectedPrice = expectedCost || expectedSupplierPrice;
      const priceChangePercent = Math.abs((liveSupplierPrice - expectedPrice) / expectedPrice) * 100;

      // 3. SAFETY CHECK: If supplier price jumped >10%, ABORT to protect margin
      if (priceChangePercent > 10) {
        return NextResponse.json(
            { 
              error: 'Price changed significantly. Please refresh the product page.',
              priceChange: priceChangePercent.toFixed(1) + '%',
              oldPrice: expectedPrice,
              newPrice: liveSupplierPrice,
            },
          { status: 409 } // Conflict
        );
      }

      // 4. Check stock status
      if (liveProduct.inStock === false) {
        return NextResponse.json(
          { error: 'Product is no longer in stock. Please try another product.' },
          { status: 409 }
        );
      }

      // 5. Update product with live price if it changed (but within tolerance)
      if (priceChangePercent > 0.1) {
        const markupMultiplier = getMarkupMultiplier();
        const newMarkedUpPrice = liveSupplierPrice * markupMultiplier;
        
        product = await prisma.product.update({
          where: { id: product.id },
          data: {
            supplierPrice: liveSupplierPrice,
            markedUpPrice: newMarkedUpPrice,
          },
        });
      }
    } catch (error) {
      // If price validation fails, log but continue with stored price
      // (Better to allow purchase than block all purchases if API is down)
      console.error('Price validation error (using stored price):', error);
      // liveSupplierPrice already set to product.supplierPrice above
    }

    // Create order with validated price
    const quantity = body.quantity || 1;
    const totalPrice = product.markedUpPrice * quantity;

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        productId: product.id,
        quantity: quantity,
        unitPrice: product.markedUpPrice,
        totalPrice: totalPrice,
        supplierPrice: liveSupplierPrice, // Use validated live price
        status: 'PENDING',
      },
    });

    // Create Stripe checkout session
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is required. Please configure Stripe in your .env file.');
    }

    // Import Stripe dynamically to avoid build-time issues
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeSecretKey);

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: product.currency.toLowerCase(),
            product_data: {
              name: product.name,
              description: product.description || undefined,
              images: product.imageUrl ? [product.imageUrl] : undefined,
            },
            unit_amount: Math.round(product.markedUpPrice * 100), // Convert to cents
          },
          quantity: quantity,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel?orderId=${order.id}`,
      metadata: {
        orderId: order.id,
        productId: product.id,
        supplierProductId: product.supplierProductId,
        userId: user.id,
      },
    });

    // Update order with payment intent ID
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentIntentId: checkoutSession.payment_intent as string },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
      orderId: order.id,
      productId: product.id,
    });
  } catch (error: any) {
    console.error('Error importing product:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
