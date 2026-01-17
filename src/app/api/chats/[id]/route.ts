import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return Response.json({ message: 'User not found' }, { status: 404 });
    }

    // Get chat with messages
    const chat = await prisma.chat.findFirst({
      where: {
        id,
        userId: user.id, // Ensure user owns this chat
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!chat) {
      return Response.json({ message: 'Chat not found' }, { status: 404 });
    }

    return Response.json(
      {
        chat,
        messages: chat.messages,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('Error in getting chat by id: ', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return Response.json({ message: 'User not found' }, { status: 404 });
    }

    // Verify chat belongs to user
    const chat = await prisma.chat.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!chat) {
      return Response.json({ message: 'Chat not found' }, { status: 404 });
    }

    // Delete chat (messages will be cascade deleted)
    await prisma.chat.delete({
      where: { id },
    });

    return Response.json(
      { message: 'Chat deleted successfully' },
      { status: 200 },
    );
  } catch (err) {
    console.error('Error in deleting chat by id: ', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};
