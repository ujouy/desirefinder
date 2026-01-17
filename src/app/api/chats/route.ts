import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

export const GET = async (req: Request) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ chats: [] }, { status: 200 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return Response.json({ chats: [] }, { status: 200 });
    }

    // Get user's chats, ordered by most recent first
    const chats = await prisma.chat.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          take: 1, // Get last message for preview
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return Response.json({ chats }, { status: 200 });
  } catch (err) {
    console.error('Error in getting chats: ', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};
