import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

/**
 * Check if user has credits before allowing search
 * Returns user credits or null if error
 */
export async function checkCredits(): Promise<{ credits: number; userId: string } | null> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, credits: true },
    });

    if (!user) {
      // User exists in Clerk but not in DB - create them with free credits
      const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      }).then((res) => res.json());

      if (clerkUser.email_addresses && clerkUser.email_addresses.length > 0) {
        const newUser = await prisma.user.create({
          data: {
            clerkId: userId,
            email: clerkUser.email_addresses[0].email_address,
            credits: 3, // Free trial
            isPremium: false,
          },
        });

        return { credits: newUser.credits, userId: newUser.id };
      }

      return null;
    }

    return { credits: user.credits, userId: user.id };
  } catch (error) {
    console.error('Error checking credits:', error);
    return null;
  }
}

/**
 * Spend one credit for a search operation
 */
export async function spendCredit(userId: string): Promise<boolean> {
  try {
    const result = await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: 1,
        },
      },
    });

    // Log transaction
    await prisma.transaction.create({
      data: {
        userId: userId,
        amount: 0, // Free search
        creditsAdded: -1, // Spent
        status: 'COMPLETED',
        packageId: 'search',
      },
    });

    return result.credits >= 0;
  } catch (error) {
    console.error('Error spending credit:', error);
    return false;
  }
}

/**
 * Middleware response for insufficient credits
 */
export function insufficientCreditsResponse() {
  return NextResponse.json(
    {
      error: 'No credits',
      message: 'You have no credits remaining. Please purchase more credits to continue searching.',
      buyUrl: '/pricing',
    },
    { status: 402 },
  );
}
