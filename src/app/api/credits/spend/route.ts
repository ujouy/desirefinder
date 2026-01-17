import { NextRequest } from 'next/server';
import creditManager from '@/lib/credits/manager';
import { auth } from '@clerk/nextjs/server';

/**
 * Spend credits (called before expensive operations)
 * Migrated to use Clerk userId instead of sessionId
 */
export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { message: 'Unauthorized', success: false },
        { status: 401 },
      );
    }

    const { amount, reason, metadata } = await req.json();

    const success = await creditManager.spendCredits(
      userId,
      amount,
      reason,
      metadata,
    );

    if (!success) {
      return Response.json(
        { message: 'Insufficient credits', success: false },
        { status: 402 },
      );
    }

    const newBalance = await creditManager.getCredits(userId);

    return Response.json({
      success: true,
      credits: newBalance,
    });
  } catch (err) {
    console.error('Error spending credits: ', err);
    return Response.json(
      { message: 'An error has occurred.', success: false },
      { status: 500 },
    );
  }
};
