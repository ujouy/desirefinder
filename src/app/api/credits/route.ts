import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * Get user's current credit balance
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ credits: 0, authenticated: false });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { credits: true },
    });

    if (!user) {
      // User not in DB yet - return 0 (will be created on first search)
      return NextResponse.json({ credits: 0, authenticated: true });
    }

    return NextResponse.json({
      credits: user.credits,
      authenticated: true,
    });
  } catch (error) {
    console.error('Error fetching credits:', error);
    return NextResponse.json(
      { credits: 0, error: 'Failed to fetch credits' },
      { status: 500 },
    );
  }
}
