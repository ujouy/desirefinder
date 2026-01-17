import { NextRequest } from 'next/server';
import creditManager from '@/lib/credits/manager';
import { auth } from '@clerk/nextjs/server';

/**
 * Track affiliate link clicks
 * Migrated to use Clerk userId instead of sessionId
 */
export const POST = async (req: NextRequest) => {
  let affiliateUrl = '/';
  
  try {
    const body = await req.json();
    const { productId, vendor, originalUrl, affiliateUrl: url } = body;
    affiliateUrl = url || originalUrl || '/';

    // Get authenticated user
    const { userId } = await auth();

    if (userId) {
      // Track affiliate click for authenticated user
      await creditManager.trackAffiliateClick(
        userId,
        productId || null,
        vendor || null,
        originalUrl,
        affiliateUrl,
      );
    }
    // If not authenticated, skip tracking but still redirect
  } catch (err) {
    console.error('Error tracking affiliate click: ', err);
    // Continue to redirect even if tracking fails
  }

  // Always redirect to affiliate URL
  return Response.redirect(affiliateUrl, 302);
};
