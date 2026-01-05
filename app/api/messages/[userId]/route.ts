
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Récupérer les messages avec un utilisateur spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: (session.user as any).id, receiverId: params.userId },
          { senderId: params.userId, receiverId: (session.user as any).id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            image: true,
            role: true,
          }
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            image: true,
            role: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Marquer les messages reçus comme lus
    await prisma.message.updateMany({
      where: {
        senderId: params.userId,
        receiverId: (session.user as any).id,
        isRead: false,
      },
      data: {
        isRead: true,
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des messages' },
      { status: 500 }
    );
  }
}
