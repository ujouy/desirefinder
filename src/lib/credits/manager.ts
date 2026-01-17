import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

/**
 * Credit cost constants
 */
export const CREDIT_COSTS = {
  SEARCH: 1, // 1 credit per search
  EMBEDDING: 0.1, // 0.1 credits per embedding operation
  LLM_GENERATION: 0.5, // 0.5 credits per LLM generation (per 100 tokens)
} as const;

/**
 * Free credits given to new users
 */
export const FREE_CREDITS = 3; // Matches Prisma schema default

/**
 * Credit Manager - Handles user credits and transactions
 * Migrated from Drizzle/SQLite to Prisma/Postgres
 */
class CreditManager {
  /**
   * Get or create user by Clerk ID
   */
  async getUser(clerkId: string, email?: string) {
    let user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      // Create new user with free credits
      user = await prisma.user.create({
        data: {
          clerkId,
          email: email || `${clerkId}@temp.com`, // Temporary email if not provided
          credits: FREE_CREDITS,
        },
      });

      // Log free credits transaction
      await prisma.transaction.create({
        data: {
          userId: user.id,
          amount: 0, // Free credits
          creditsAdded: FREE_CREDITS,
          status: 'COMPLETED',
          packageId: 'welcome_bonus',
        },
      });
    }

    return user;
  }

  /**
   * Get user from Clerk auth (server-side)
   */
  async getUserFromAuth() {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return null;
    }

    const email = sessionClaims?.email as string | undefined;
    return this.getUser(userId, email);
  }

  /**
   * Check if user has enough credits
   */
  async hasCredits(clerkId: string, amount: number): Promise<boolean> {
    const user = await this.getUser(clerkId);
    return (user?.credits || 0) >= amount;
  }

  /**
   * Spend credits
   */
  async spendCredits(
    clerkId: string,
    amount: number,
    reason: string,
    metadata?: Record<string, any>,
  ): Promise<boolean> {
    const user = await this.getUser(clerkId);

    if (!user || user.credits < amount) {
      return false;
    }

    // Use transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Update user credits
      await tx.user.update({
        where: { id: user.id },
        data: {
          credits: {
            decrement: amount,
          },
        },
      });

      // Log transaction (using Transaction model for credit purchases)
      // For credit spending, we can track it in metadata
      // Note: Transaction model is for payment transactions, not credit spending
      // We could add a CreditTransaction model later if needed
    });

    return true;
  }

  /**
   * Add credits (for purchases, bonuses, affiliate earnings)
   */
  async addCredits(
    clerkId: string,
    amount: number,
    type: 'purchased' | 'earned' | 'bonus',
    reason: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const user = await this.getUser(clerkId);

    if (!user) return;

    await prisma.$transaction(async (tx) => {
      // Update user credits
      await tx.user.update({
        where: { id: user.id },
        data: {
          credits: {
            increment: amount,
          },
        },
      });

      // If purchased, create Transaction record
      if (type === 'purchased') {
        await tx.transaction.create({
          data: {
            userId: user.id,
            amount: 0, // Will be set by payment webhook
            creditsAdded: amount,
            status: 'PENDING',
            packageId: reason,
          },
        });
      }
    });
  }

  /**
   * Get user's current credit balance
   */
  async getCredits(clerkId: string): Promise<number> {
    const user = await this.getUser(clerkId);
    return user?.credits || 0;
  }

  /**
   * Track affiliate click and potentially award credits
   */
  async trackAffiliateClick(
    clerkId: string,
    productId: string | null,
    vendor: string | null,
    originalUrl: string,
    affiliateUrl: string,
  ): Promise<void> {
    const user = await this.getUser(clerkId);

    if (!user) return;

    // Log the click using Prisma
    await prisma.affiliateClick.create({
      data: {
        userId: user.id,
        productId: productId || null,
        vendor: vendor || null,
        originalUrl,
        affiliateUrl,
        converted: 0, // Will be updated if conversion happens
      },
    });
  }
}

const creditManager = new CreditManager();

export default creditManager;
