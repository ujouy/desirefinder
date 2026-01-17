import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: Request) {
  // Get the Svix headers for verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses } = evt.data;

    if (!id || !email_addresses || email_addresses.length === 0) {
      return new Response('Missing user data', { status: 400 });
    }

    const email = email_addresses[0].email_address;

    try {
      // Create user in database with 3 free trial credits
      await prisma.user.create({
        data: {
          clerkId: id,
          email: email,
          credits: 3, // Free trial credits
          isPremium: false,
        },
      });

      console.log(`User created: ${email} with 3 free credits`);
    } catch (error: any) {
      // Handle duplicate user (already exists)
      if (error.code === 'P2002') {
        console.log(`User already exists: ${email}`);
        return new Response('User already exists', { status: 200 });
      }
      console.error('Error creating user:', error);
      return new Response('Error creating user', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses } = evt.data;

    if (!id || !email_addresses || email_addresses.length === 0) {
      return new Response('Missing user data', { status: 400 });
    }

    const email = email_addresses[0].email_address;

    try {
      // Update user email if changed
      await prisma.user.update({
        where: { clerkId: id },
        data: { email: email },
      });
    } catch (error) {
      console.error('Error updating user:', error);
      // Don't fail the webhook if user doesn't exist yet
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      // Delete user (cascade will handle related records)
      await prisma.user.delete({
        where: { clerkId: id },
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      // Don't fail if user doesn't exist
    }
  }

  return new Response('', { status: 200 });
}
