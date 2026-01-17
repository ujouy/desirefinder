import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import crypto from 'crypto';

/**
 * NowPayments IPN (Instant Payment Notification) Webhook
 * Verifies payment and adds credits to user account
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signature = req.headers.get('x-nowpayments-sig');

    // 🛡️ SECURITY: Verify webhook signature (REQUIRED - fail closed)
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
    const signature = req.headers.get('x-nowpayments-sig');

    if (!ipnSecret) {
      console.error('NOWPAYMENTS_IPN_SECRET not configured - webhook security disabled');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    if (!signature) {
      console.error('Missing webhook signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    // Verify signature using HMAC SHA-512
    const expectedSignature = crypto
      .createHmac('sha512', ipnSecret)
      .update(JSON.stringify(body))
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    if (signature.length !== expectedSignature.length) {
      console.error('Invalid webhook signature (length mismatch)');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    let isValid = true;
    for (let i = 0; i < signature.length; i++) {
      if (signature[i] !== expectedSignature[i]) {
        isValid = false;
      }
    }

    if (!isValid) {
      console.error('Invalid webhook signature (content mismatch)');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { payment_status, order_id, payment_id } = body;

    if (!order_id) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
    }

    // Find transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: order_id },
      include: { user: true },
    });

    if (!transaction) {
      console.error(`Transaction not found: ${order_id}`);
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Handle payment status
    if (payment_status === 'confirmed' || payment_status === 'finished') {
      // Payment successful - add credits
      if (transaction.status !== 'COMPLETED') {
        await prisma.$transaction([
          // Update transaction
          prisma.transaction.update({
            where: { id: transaction.id },
            data: {
              status: 'COMPLETED',
              paymentId: payment_id?.toString() || transaction.paymentId,
            },
          }),
          // Add credits to user
          prisma.user.update({
            where: { id: transaction.userId },
            data: {
              credits: {
                increment: transaction.creditsAdded,
              },
            },
          }),
        ]);

        console.log(`Payment completed: ${order_id}, added ${transaction.creditsAdded} credits`);
      }
    } else if (payment_status === 'failed' || payment_status === 'expired') {
      // Payment failed
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      });

      console.log(`Payment failed: ${order_id}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing NowPayments webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// NowPayments also sends GET requests for verification
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
