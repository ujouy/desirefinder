import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import crypto from 'crypto';

// Credit packages
const PACKAGES = {
  'trial': { credits: 3, price: 0, name: 'Voyeur (Trial)' },
  '50-credits': { credits: 50, price: 5, name: 'Explorer' },
  '200-credits': { credits: 200, price: 15, name: 'Collector' },
} as const;

type PackageId = keyof typeof PACKAGES;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const { packageId } = await req.json();

    if (!packageId || !(packageId in PACKAGES)) {
      return NextResponse.json(
        { error: 'Invalid package ID' },
        { status: 400 },
      );
    }

    const packageData = PACKAGES[packageId as PackageId];

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    // Free trial - just add credits
    if (packageId === 'trial') {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          credits: {
            increment: packageData.credits,
          },
        },
      });

      return NextResponse.json({
        success: true,
        credits: user.credits + packageData.credits,
        message: 'Free trial credits added!',
      });
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: packageData.price,
        creditsAdded: packageData.credits,
        status: 'PENDING',
        packageId: packageId,
      },
    });

    // Create NowPayments invoice
    const nowpaymentsApiKey = process.env.NOWPAYMENTS_API_KEY;

    if (!nowpaymentsApiKey) {
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 },
      );
    }

    // Generate payment invoice via NowPayments API
    const invoiceResponse = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'x-api-key': nowpaymentsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: packageData.price,
        price_currency: 'usd',
        pay_currency: 'btc', // Can be made configurable
        order_id: transaction.id,
        order_description: `${packageData.name} - ${packageData.credits} credits`,
        ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nowpayments`,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      }),
    });

    if (!invoiceResponse.ok) {
      const error = await invoiceResponse.text();
      console.error('NowPayments API error:', error);
      
      // Update transaction as failed
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      });

      return NextResponse.json(
        { error: 'Failed to create payment. Please try again.' },
        { status: 500 },
      );
    }

    const invoiceData = await invoiceResponse.json();

    // Update transaction with payment ID
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { paymentId: invoiceData.payment_id?.toString() },
    });

    return NextResponse.json({
      success: true,
      paymentUrl: invoiceData.invoice_url || invoiceData.pay_url,
      transactionId: transaction.id,
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
